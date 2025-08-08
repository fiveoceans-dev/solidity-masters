import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Solidity Masters',
  description: 'Ultimate Solidity Championship',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
