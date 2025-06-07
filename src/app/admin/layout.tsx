
import type React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is available for admin pages if needed

export const metadata = {
  title: 'Saleeka Admin',
  description: 'Administration panel for Saleeka.',
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <AdminLayout>{children}</AdminLayout>
        <Toaster />
      </body>
    </html>
  );
}
