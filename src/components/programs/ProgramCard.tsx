import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Program } from '@/lib/constants';
import SummarizeButton from '@/components/shared/SummarizeButton'; // Import the SummarizeButton

type ProgramCardProps = {
  program: Program;
};

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {program.image && (
        <div className="relative w-full h-48">
          <Image
            src={program.image}
            alt={program.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${program.category} program`}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="font-headline text-xl">{program.title}</CardTitle>
          <Badge variant="secondary" className="whitespace-nowrap">{program.category}</Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground h-20 overflow-hidden">
          {program.description.substring(0, 120)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {program.tags && program.tags.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">TAGS</h4>
            <div className="flex flex-wrap gap-1">
              {program.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
         {/* AI Summarization Button */}
        <SummarizeButton 
          contentToSummarize={program.description} 
          buttonText="Key Takeaways"
          label="AI Key Takeaways"
        />
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" className="w-full">
          <Link href={`/programs/${program.id}`}>Learn More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProgramCard;
