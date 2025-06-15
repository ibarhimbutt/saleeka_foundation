
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
import { useAuth } from '@/contexts/AuthContext'; 

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading, logout } = useAuth(); 

  React.useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [user, loading, router, pathname]);

  React.useEffect(() => {
    if (userProfile) {
      console.log("Admin User Role:", userProfile.role);
      console.log("Admin User Type:", userProfile.type);
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && pathname !== '/admin/login') {
    return null; 
  }
  
  if (user && pathname === '/admin/login') {
    router.replace('/admin');
    return (
       <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform">
        <ScrollArea className="h-full">
          <div className="flex h-full flex-col p-4">
            <Link href="/admin" className="mb-6 flex items-center gap-2 px-2">
              <Image
                src="/saleeka-logo.png" // Using static logo
                alt="Saleeka Admin Logo"
                width={100} // Adjust as needed
                height={34} // Adjust as needed
                className="object-contain"
                priority
              />
              <span className="font-headline text-xl font-semibold text-primary">Admin</span>
            </Link>
            <nav className="flex-1 space-y-1">
              {adminNavLinks.map((link) => {
                if (!link || typeof link.href !== 'string' || typeof link.label !== 'string') {
                  console.error("Malformed admin nav link encountered:", link);
                  return null; 
                }
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Button
                    key={link.href}
                    asChild
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
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
                  Logged in as: {userProfile?.displayName || (user ? user.email : 'N/A')}
                  <br />
                  Role: {userProfile?.role || 'N/A'} | Type: {userProfile?.type || 'N/A'}
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
