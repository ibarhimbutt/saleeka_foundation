
import type React from 'react';
// Toaster is removed from here as it's in the root layout

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
      {/* AuthProvider was already removed, children are rendered directly */}
      {/* The Toaster component is removed from here to avoid duplication, as it's in the root layout. */}
      {children}
    </>
  );
}
