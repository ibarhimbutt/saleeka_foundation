import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-8 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-headline text-lg font-semibold mb-2 text-primary">SaleekaConnect</h3>
            <p className="text-sm text-muted-foreground">
              Discover Your Path. Empower Your Future. The SALEEKA Way.
            </p>
          </div>
          <div>
            <h4 className="font-headline text-md font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><Link href="/about" className="text-sm hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/programs" className="text-sm hover:text-primary transition-colors">Programs</Link></li>
              <li><Link href="/blog" className="text-sm hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-md font-semibold mb-2">Connect With Us</h4>
            <div className="flex justify-center md:justify-start space-x-4 mb-2">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></Link>
              <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></Link>
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></Link>
            </div>
            <p className="text-sm text-muted-foreground">Email: info@saleeka.org</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Saleeka Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
