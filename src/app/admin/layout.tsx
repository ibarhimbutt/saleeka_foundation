
import type React from 'react';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import { Toaster } from "@/components/ui/toaster";

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
    <>
      <AuthProvider> {/* Wrap with AuthProvider */}
        {/* 
          The AdminLayout component (with sidebar) is applied by individual page.tsx files 
          within the /admin route group (e.g., /admin/page.tsx, /admin/students/page.tsx).
          The /admin/login/page.tsx does NOT use that shared AdminLayout component.
          This RootAdminLayout provides the AuthContext to all children under /admin.
        */}
        {children}
      </AuthProvider>
      <Toaster />
    </>
  );
}
