'use client';

import { useState } from 'react';
import SectionTitle from '@/components/shared/SectionTitle';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { sampleBlogPosts } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Share2 } from 'lucide-react';

// Unique tags for filtering
const allTags = Array.from(new Set(sampleBlogPosts.flatMap(post => post.tags)));

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const featuredPost = sampleBlogPosts[0]; // Assuming the first post is featured
  const regularPosts = sampleBlogPosts.slice(1);

  const filteredPosts = regularPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-16">
      <SectionTitle
        title="Saleeka Blog"
        subtitle="Insights, stories, and updates from the Saleeka Foundation community."
      />

      {/* Featured Story Section */}
      {featuredPost && (
        <section className="container">
          <h3 className="font-headline text-2xl font-semibold mb-6 text-primary">Featured Story</h3>
          <BlogPostCard post={featuredPost} isFeatured />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 size={16} /> Share
            </Button>
          </div>
        </section>
      )}
      
      {/* Search and Filter Section */}
      <section className="container">
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border rounded-lg bg-card">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground hidden md:inline">Filter by tag:</span>
            <Button 
              variant={selectedTag === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {allTags.slice(0, 4).map(tag => ( // Show limited tags for brevity
              <Button 
                key={tag} 
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts List */}
      <section className="container">
        <h3 className="font-headline text-2xl font-semibold mb-6 text-primary">Latest Articles</h3>
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No articles found matching your criteria.</p>
        )}
      </section>
    </div>
  );
}
