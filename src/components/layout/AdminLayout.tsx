
"use client";
import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { adminNavLinks } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut } from 'lucide-react';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();

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
              <Button variant="outline" className="w-full justify-start">
                 <LogOut className="mr-2 h-5 w-5" /> Logout (Placeholder)
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
