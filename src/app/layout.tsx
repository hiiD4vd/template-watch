import type { Metadata } from 'next';
import { assetUrl } from '../lib/assets';
import '../styles/base.css';
import '../styles/overrides.css';
import '../styles/watch.css';

export const metadata: Metadata = {
  title: 'PROMPTED SITE - The timeless automatic watch by promptedsite',
  description: 'An interactive exploration of the timeless automatic watch.',
  icons: { icon: assetUrl('branding/favicon.png') },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
