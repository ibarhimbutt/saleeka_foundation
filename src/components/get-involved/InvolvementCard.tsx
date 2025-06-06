import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InvolvementType } from '@/lib/constants';

type InvolvementCardProps = {
  item: InvolvementType;
};

const InvolvementCard: React.FC<InvolvementCardProps> = ({ item }) => {
  const IconComponent = item.icon;
  return (
    <Card className="flex flex-col h-full text-center hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        {IconComponent && (
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <IconComponent className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
        )}
        <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-accent hover:bg-accent/90">
          <Link href={`/get-involved?tab=${item.id}`}>{item.ctaText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InvolvementCard;
