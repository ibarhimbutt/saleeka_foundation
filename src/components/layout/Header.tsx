
'use client';

import Link from 'next/link';
import Image from 'next/image'; // Ensure Image is imported
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { navLinks } from '@/lib/constants';
import { cn } from '@/lib/utils';

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; 
  }

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-foreground/80",
            mobile ? "block py-2 px-4 text-lg" : "px-3 py-2"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between"> {/* Increased height for taller logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://placehold.co/120x60.png" 
            alt="Saleeka Logo"
            width={120} 
            height={60} 
            data-ai-hint="Saleeka logo text"
            className="object-contain" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <NavItems />
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
              <SheetHeader className="text-left mb-4">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                        <Image
                          src="https://placehold.co/120x60.png" 
                          alt="Saleeka Logo"
                          width={120} 
                          height={60} 
                          data-ai-hint="Saleeka logo text"
                          className="object-contain"
                        />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </div>
              </SheetHeader>
              <nav className="flex flex-col space-y-2">
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
