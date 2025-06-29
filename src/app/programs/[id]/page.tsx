import { samplePrograms, type Program } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SummarizeButton from '@/components/shared/SummarizeButton';
import AiImage from '@/components/shared/AiImage';

export async function generateStaticParams() {
  return samplePrograms.map((program) => ({
    id: program.id,
  }));
}

type ProgramPageProps = {
  params: Promise<{ id: string }>; // Changed to Promise for Next.js 15
};

export default async function ProgramPage({ params }: ProgramPageProps) {
  // Await the params object
  const { id } = await params;
  const program = samplePrograms.find((p) => p.id === id);

  if (!program) {
    return (
      <div className="container text-center py-12">
        <h1 className="text-2xl font-bold">Program Not Found</h1>
        <p className="text-muted-foreground">Sorry, we couldn't find the program you're looking for.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/programs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <article className="container max-w-3xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm" className="hover:bg-accent/10">
            <Link href="/programs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden shadow-lg">
          {program.image && (
            <div className="relative w-full h-64 md:h-80 rounded-t-lg overflow-hidden">
              <AiImage
                prompt={`an illustrative image for a ${program.category} program titled "${program.title}"`}
                alt={program.title}
                width={800}
                height={400}
                className="w-full h-full"
                imageClassName="object-cover"
                fallbackImageUrl={program.image}
              />
            </div>
          )}
          <CardHeader className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <CardTitle className="font-headline text-3xl md:text-4xl text-primary">{program.title}</CardTitle>
                <Badge variant="secondary" className="text-sm whitespace-nowrap mt-1 sm:mt-0">{program.category}</Badge>
            </div>
            
            {program.tags && program.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {program.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6 pt-0 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
            {program.description.split('\\n\\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-foreground/90 leading-relaxed">{paragraph}</p>
            ))}
            <div className="mt-6 not-prose"> 
              <SummarizeButton
                contentToSummarize={program.description}
                buttonText="AI Summary of Program Details"
                label="AI Program Summary"
              />
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}