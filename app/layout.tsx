import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DesignStudio CRM',
  description: 'Локальная CRM для отдела продаж — ДЗ-9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
