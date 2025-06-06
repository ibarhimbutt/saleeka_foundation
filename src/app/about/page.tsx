import Image from 'next/image';
import SectionTitle from '@/components/shared/SectionTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sampleTeamMembers, samplePartners } from '@/lib/constants';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <SectionTitle
        title="About Saleeka Foundation"
        subtitle="Connecting talent with opportunity, fostering growth, and building a collaborative future."
      />

      {/* Vision and Mission Section */}
      <section className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://placehold.co/600x450.png"
              alt="Group of diverse people collaborating"
              width={600}
              height={450}
              className="w-full h-auto object-cover"
              data-ai-hint="collaboration team"
            />
          </div>
          <div>
            <h3 className="font-headline text-2xl font-semibold mb-4 text-primary">Our Vision</h3>
            <p className="text-muted-foreground mb-6">
              To be a leading catalyst in creating a world where every individual has the opportunity to reach their full potential through meaningful connections and collaborative learning.
            </p>
            <h3 className="font-headline text-2xl font-semibold mb-4 text-accent">Our Mission</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1 shrink-0" />
                <span>To connect students with experienced professionals for mentorship and guidance.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1 shrink-0" />
                <span>To provide platforms for students to work on real-world projects with organizations.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1 shrink-0" />
                <span>To facilitate internship opportunities that bridge academic learning with practical skills.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1 shrink-0" />
                <span>To empower donors to support impactful initiatives and educational advancement.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Founding Story Section */}
      <section className="container bg-secondary/30 py-12 rounded-lg shadow-sm">
        <h3 className="font-headline text-3xl font-semibold mb-6 text-center text-primary">Our Founding Story</h3>
        <div className="max-w-3xl mx-auto text-muted-foreground space-y-4 text-center md:text-left">
          <p>
            Saleeka Foundation was born from a simple yet powerful idea: that collective effort and shared knowledge can unlock boundless potential. Our founders, a group of passionate educators, industry leaders, and philanthropists, recognized the challenges faced by students in transitioning to the professional world and the desire of experienced individuals to give back.
          </p>
          <p>
            Driven by the "Saleeka" (meaning skill, taste, or refined manner in Urdu/Hindi) principle of doing things with thoughtfulness and excellence, we set out to create a platform that not only connects people but also fosters a culture of continuous learning, mutual respect, and community impact.
          </p>
          <p>
            Since our inception, we've been committed to building bridges and empowering individuals to discover their path and shape their future.
          </p>
        </div>
      </section>

      {/* Team Bios Section */}
      <section className="container">
        <SectionTitle title="Meet Our Team" subtitle="The passionate individuals dedicated to making Saleeka's vision a reality." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleTeamMembers.map((member) => (
            <Card key={member.id} className="text-center overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="p-0">
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="w-full h-56 object-cover"
                  data-ai-hint="professional portrait"
                />
              </CardHeader>
              <CardContent className="p-6">
                <h4 className="font-headline text-xl font-semibold mb-1">{member.name}</h4>
                <p className="text-sm text-accent font-medium mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Partner Organizations Section */}
      <section className="container">
        <SectionTitle title="Our Valued Partners" subtitle="Collaborating with leading organizations to expand opportunities and impact." />
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
          {samplePartners.map((partner) => (
            <a key={partner.id} href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={150}
                height={80}
                className="object-contain transition-opacity hover:opacity-75"
                data-ai-hint="company logo"
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
