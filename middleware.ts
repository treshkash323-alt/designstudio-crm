import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith('/dashboard') || path.startsWith('/admin');

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path.startsWith('/admin')) {
    const role = user?.app_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (path === '/login' && user) {
    const role = user.app_metadata?.role;
    const target = role === 'admin' ? '/admin/clients' : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};
