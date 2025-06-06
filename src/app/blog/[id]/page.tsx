import { sampleBlogPosts, type BlogPost } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, UserCircle, Tag } from 'lucide-react';

export async function generateStaticParams() {
  return sampleBlogPosts.map((post) => ({
    id: post.id,
  }));
}

type BlogPostPageProps = {
  params: { id: string };
};

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = sampleBlogPosts.find((p) => p.id === params.id);

  if (!post) {
    return (
      <div className="container text-center py-12">
        <h1 className="text-2xl font-bold">Blog Post Not Found</h1>
        <p className="text-muted-foreground">Sorry, we couldn't find the blog post you're looking for.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  const fullContent = post.content || post.excerpt + " (Full content would go here if available.)";

  return (
    <div className="space-y-8 py-8">
      <article className="container max-w-3xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm" className="hover:bg-accent/10">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden shadow-lg">
          {post.imageUrl && (
            <div className="relative w-full h-64 md:h-80 rounded-t-lg overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint="blog post header"
              />
            </div>
          )}
          <CardHeader className="p-6">
            <CardTitle className="font-headline text-3xl md:text-4xl mb-3 text-primary">{post.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5"><UserCircle size={16} /> {post.author}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={16} /> {post.date}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <Tag size={18} className="text-muted-foreground mr-1"/>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6 pt-0 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
            {fullContent.split('\\n\\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-foreground/90 leading-relaxed">{paragraph}</p>
            ))}
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
