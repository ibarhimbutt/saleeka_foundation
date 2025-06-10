
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext'; // Ensure AuthProvider is imported

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Saleeka Connect - Empowering Futures',
  description: 'Connecting Students, Professionals, Organizations, and Donors for a brighter future. The Saleeka Way.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Google Fonts links are handled by next/font, no need for manual <link> tags */}
      </head>
      <body className="font-body antialiased">
        <AuthProvider> {/* AuthProvider now wraps MainLayout and thus all its children like Header */}
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
