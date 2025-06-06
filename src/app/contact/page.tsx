import SectionTitle from '@/components/shared/SectionTitle';
import ContactForm from '@/components/contact/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <SectionTitle
        title="Contact Us"
        subtitle="We're here to help and answer any question you might have. We look forward to hearing from you!"
      />

      <section className="container">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <ContactForm />
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-primary">
                  <Mail size={24} /> Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For general inquiries, partnerships, or support:
                </p>
                <a href="mailto:info@saleeka.org" className="text-accent font-medium hover:underline">
                  info@saleeka.org
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-primary">
                  <Phone size={24} /> Call Us (Placeholder)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reach out to us during business hours:
                </p>
                <p className="text-accent font-medium">
                  +1 (555) 123-4567 (Example)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-primary">
                  <MapPin size={24} /> Our Location (Placeholder)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Saleeka Foundation Headquarters:
                </p>
                <p className="text-accent font-medium">
                  123 Innovation Drive, Tech City, TX 75001 (Example)
                </p>
                {/* Placeholder for Google Maps embed. This can be added later if needed.
                    Example: <div className="mt-4 h-64 bg-muted rounded-md">Google Map Placeholder</div> 
                */}
                 <div className="mt-4 h-64 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground italic">Google Maps Placeholder</p>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
