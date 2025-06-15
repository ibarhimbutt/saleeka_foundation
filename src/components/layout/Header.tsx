
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, LogOut as LogOutIcon, LayoutDashboard, UserCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { navLinks as baseNavLinks, type NavLink } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, userProfile, loading, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return ( 
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
           <Link href="/" className="flex items-center">
            <Image
              src="/saleeka-logo.png" // Using static logo
              alt="Saleeka Foundation Logo"
              width={120} // Adjust as needed
              height={40} // Adjust as needed
              className="object-contain"
              priority // Prioritize loading the logo
            />
          </Link>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" disabled>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  const renderLink = (link: NavLink, isMobile: boolean) => {
    const commonClasses = cn(
      "text-sm font-medium transition-colors hover:text-primary",
      pathname === link.href && !link.action ? "text-primary" : "text-foreground/80",
      isMobile ? "block py-2 px-4 text-lg" : "px-3 py-2"
    );

    if (link.action) {
      return (
        <button onClick={link.action} className={cn(commonClasses, "flex items-center gap-2")}>
          {link.icon && <link.icon className="h-5 w-5" />}
          {link.label}
        </button>
      );
    }
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        className={cn(commonClasses, "flex items-center gap-2")}
      >
        {link.icon && <link.icon className="h-5 w-5" />}
        {link.label}
      </Link>
    );
  };
  
  const AuthDependentLinks = ({ isMobile }: { isMobile: boolean }) => {
    if (loading) {
      return (
        <div className={cn("flex items-center", isMobile ? "px-4 py-2" : "px-3 py-2")}>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (user && userProfile && typeof userProfile.type === 'string') {
      const isAdmin = userProfile.type === 'admin';
      return (
        <>
          {isAdmin ? (
            renderLink({ href: '/admin', label: 'Admin', icon: LayoutDashboard }, isMobile)
          ) : (
            renderLink({ href: '/my-saleeka', label: 'My Saleeka', icon: UserCircle }, isMobile)
          )}
          {renderLink({ href: '#logout', label: 'Logout', icon: LogOutIcon, action: async () => {
            if (isMobile) setIsMobileMenuOpen(false);
            await logout();
           }
          }, isMobile)}
        </>
      );
    }

    if (!user) {
      return renderLink({ href: '/admin/login', label: 'Login', icon: LogIn }, isMobile);
    }
    
    return (
        <div className={cn("flex items-center", isMobile ? "px-4 py-2" : "px-3 py-2")}>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="sr-only text-xs">Loading profile...</span>
        </div>
    );
  };


  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {baseNavLinks.map((link) => renderLink(link, mobile))}
      <AuthDependentLinks isMobile={mobile} />
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/saleeka-logo.png" // Using static logo
            alt="Saleeka Foundation Logo"
            width={120} // Adjust as needed
            height={40} // Adjust as needed
            className="object-contain"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <NavItems />
        </nav>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-0"> 
              <SheetHeader className="text-left p-4 border-b"> 
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                        <Image
                          src="/saleeka-logo.png" // Using static logo
                          alt="Saleeka Foundation Logo"
                          width={120} // Adjust as needed
                          height={40} // Adjust as needed
                          className="object-contain"
                          priority
                        />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </div>
              </SheetHeader>
              <nav className="flex flex-col space-y-1 p-4"> 
                  <NavItems mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
