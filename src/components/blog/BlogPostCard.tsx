
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/constants';
import { CalendarDays, UserCircle, Tag } from 'lucide-react';
import AiImage from '@/components/shared/AiImage';

type BlogPostCardProps = {
  post: BlogPost;
  isFeatured?: boolean;
};

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, isFeatured = false }) => {
  return (
    <Card className={`flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 ${isFeatured ? 'lg:flex-row' : ''}`}>
      <div className={`relative w-full ${isFeatured ? 'lg:w-1/2' : ''} h-56 ${isFeatured ? 'lg:h-auto' : 'min-h-[14rem]'}`}>
        <AiImage
          prompt={`an engaging image for a blog article titled "${post.title}"`}
          alt={post.title}
          width={isFeatured ? 400 : 300}
          height={isFeatured ? 400 : 224}
          className="w-full h-full"
          imageClassName="object-cover"
          fallbackImageUrl={post.imageUrl}
        />
        {isFeatured && (
           <div className="absolute top-4 left-4">
             <Badge className="bg-accent text-accent-foreground">Featured</Badge>
           </div>
        )}
      </div>
      <div className={`flex flex-col ${isFeatured ? 'lg:w-1/2' : ''} p-0`}>
        <CardHeader className={isFeatured ? 'p-6' : 'p-4'}>
          <CardTitle className={`font-headline ${isFeatured ? 'text-2xl' : 'text-xl'} mb-2`}>{post.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><UserCircle size={14} /> {post.author}</span>
            <span className="flex items-center gap-1"><CalendarDays size={14} /> {post.date}</span>
          </div>
          <CardDescription className={`text-sm text-muted-foreground ${isFeatured ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className={`flex-grow ${isFeatured ? 'px-6 pb-4' : 'px-4 pb-2'}`}>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Tag size={16} className="text-muted-foreground mr-1"/>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className={isFeatured ? 'p-6' : 'p-4'}>
          <Button asChild variant="link" className="p-0 h-auto text-primary">
            <Link href={`/blog/${post.id}`}>Read More &rarr;</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default BlogPostCard;
