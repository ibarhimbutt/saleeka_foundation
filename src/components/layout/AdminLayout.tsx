
"use client";
import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { adminNavLinks } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth(); // Use the auth context

  React.useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && pathname !== '/admin/login') {
    // This check is mainly for the initial render before useEffect kicks in,
    // or if somehow useEffect doesn't redirect immediately.
    // The actual redirection is handled by useEffect.
    return null; // Or a minimal loading/redirecting message
  }
  
  // If we are on the login page and the user is already logged in, redirect to admin dashboard
  if (user && pathname === '/admin/login') {
    router.replace('/admin');
    return (
       <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Redirecting...</p>
      </div>
    );
  }


  // If it's the login page, don't render the full AdminLayout (sidebar, etc.)
  // The login page has its own layout structure.
  // This case should ideally be handled by routing logic (e.g. group routes)
  // but for simplicity, we check pathname here.
  // However, the AuthProvider in `app/admin/layout.tsx` wraps all admin routes,
  // so AdminLayout will still be invoked for /admin/login.
  // The useEffect hook above handles redirecting away from /admin/login if already logged in.
  // If not logged in, and on /admin/login, we shouldn't show the sidebar.
  // This scenario means the `children` prop IS the login page.
  // This specific component (AdminLayout.tsx) is meant for PAGES *OTHER THAN* login.
  // This component (AdminLayout) is applied via the AdminDashboardPage, AdminStudentsPage, etc.
  // The /admin/login page uses its own layout directly.
  // The `user` check and `useEffect` at the top are the primary guards.

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform">
        <ScrollArea className="h-full">
          <div className="flex h-full flex-col p-4">
            <Link href="/admin" className="mb-6 flex items-center gap-2 px-2">
              <Image
                src="https://placehold.co/100x50.png"
                alt="Saleeka Admin Logo"
                width={100}
                height={50}
                data-ai-hint="Saleeka logo text"
                className="object-contain"
              />
              <span className="font-headline text-xl font-semibold text-primary">Admin</span>
            </Link>
            <nav className="flex-1 space-y-1">
              {adminNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.href}
                    asChild
                    variant={pathname === link.href ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start",
                      pathname === link.href && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Link href={link.href} className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5" />}
                      {link.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
            <div className="mt-auto">
              {user && (
                <div className="mb-2 px-2 py-1 text-xs text-muted-foreground">
                  Logged in as: {user.email}
                </div>
              )}
              <Button variant="outline" className="w-full justify-start" onClick={logout}>
                 <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>
      <main className="ml-64 flex-1 flex-col p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
