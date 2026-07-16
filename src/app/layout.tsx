import type { Metadata } from 'next';
import { businessConfig } from '@/config/business';
import './globals.css';
export const metadata: Metadata = {
  title: businessConfig.displayName,
  description: 'Secure TCG business platform foundation.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
