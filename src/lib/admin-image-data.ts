
/**
 * @fileOverview Data for the admin page that lists predefined AI images
 * and allows triggering their generation.
 */

export type AdminImageData = {
  id: string; // Sanitized prompt, used as a key
  prompt: string;
  width: number;
  height: number;
  sourceContext: string;
};

// This data is based on the table generated previously.
// The 'id' should ideally be generated using sanitizePromptForClientCacheKey(prompt)
// to ensure consistency if used as a cache key elsewhere.
export const adminPredefinedImages: AdminImageData[] = [
  {
    id: 'a-diverse-group-of-people-collaborating-on-a-shared-mission-conve',
    prompt: 'a diverse group of people collaborating on a shared mission, conveying vision and teamwork',
    width: 600,
    height: 450,
    sourceContext: 'src/app/about/page.tsx',
  },
  {
    id: 'an-illustrative-professional-portrait-of-najam-rashid-founder-ceo',
    prompt: 'an illustrative professional portrait of Najam Rashid, Founder & CEO',
    width: 300,
    height: 300,
    sourceContext: 'src/app/about/page.tsx (Team Member)',
  },
  {
    id: 'an-illustrative-professional-portrait-of-iffat-shaheen-head-of-pr',
    prompt: 'an illustrative professional portrait of Iffat Shaheen, Head of Programs',
    width: 300,
    height: 300,
    sourceContext: 'src/app/about/page.tsx (Team Member)',
  },
  {
    id: 'an-illustrative-professional-portrait-of-taaha-najam-community-ma',
    prompt: 'an illustrative professional portrait of Taaha Najam, Community Manager',
    width: 300,
    height: 300,
    sourceContext: 'src/app/about/page.tsx (Team Member)',
  },
  {
    id: 'a-modern-abstract-logo-for-a-company-named-innovatech-solutions',
    prompt: 'a modern, abstract logo for a company named Innovatech Solutions',
    width: 150,
    height: 80,
    sourceContext: 'src/app/about/page.tsx (Partner)',
  },
  {
    id: 'a-modern-abstract-logo-for-a-company-named-future-leaders-initiat',
    prompt: 'a modern, abstract logo for a company named Future Leaders Initiative',
    width: 150,
    height: 80,
    sourceContext: 'src/app/about/page.tsx (Partner)',
  },
  {
    id: 'a-modern-abstract-logo-for-a-company-named-techsphere-academy',
    prompt: 'a modern, abstract logo for a company named TechSphere Academy',
    width: 150,
    height: 80,
    sourceContext: 'src/app/about/page.tsx (Partner)',
  },
  {
    id: 'a-header-image-for-a-blog-post-titled-the-future-of-work-adapting',
    prompt: 'a header image for a blog post titled "The Future of Work: Adapting to New Trends"',
    width: 800,
    height: 400,
    sourceContext: 'src/app/blog/[id]/page.tsx',
  },
  {
    id: 'a-header-image-for-a-blog-post-titled-unlocking-your-potential-th',
    prompt: 'a header image for a blog post titled "Unlocking Your Potential Through Mentorship"',
    width: 800,
    height: 400,
    sourceContext: 'src/app/blog/[id]/page.tsx',
  },
  {
    id: 'a-header-image-for-a-blog-post-titled-making-an-impact-how-studen',
    prompt: 'a header image for a blog post titled "Making an Impact: How Student Projects Shape Communities"',
    width: 800,
    height: 400,
    sourceContext: 'src/app/blog/[id]/page.tsx',
  },
  {
    id: 'an-engaging-image-for-a-blog-article-titled-the-future-of-work-ad',
    prompt: 'an engaging image for a blog article titled "The Future of Work: Adapting to New Trends"',
    width: 400,
    height: 400,
    sourceContext: 'src/components/blog/BlogPostCard.tsx (Featured)',
  },
  {
    id: 'an-engaging-image-for-a-blog-article-titled-unlocking-your-potent',
    prompt: 'an engaging image for a blog article titled "Unlocking Your Potential Through Mentorship"',
    width: 300,
    height: 224,
    sourceContext: 'src/components/blog/BlogPostCard.tsx (Regular)',
  },
  {
    id: 'an-engaging-image-for-a-blog-article-titled-making-an-impact-how-',
    prompt: 'an engaging image for a blog article titled "Making an Impact: How Student Projects Shape Communities"',
    width: 300,
    height: 224,
    sourceContext: 'src/components/blog/BlogPostCard.tsx (Regular)',
  },
  {
    id: 'an-abstract-network-graphic-showing-four-distinct-but-interconnec',
    prompt: "an abstract network graphic showing four distinct but interconnected pillars, symbolizing a foundation's core components",
    width: 800,
    height: 300,
    sourceContext: 'src/app/page.tsx',
  },
  {
    id: 'an-illustrative-image-for-a-mentorship-program-titled-ai-mentorsh',
    prompt: 'an illustrative image for a Mentorship program titled "AI Mentorship Program"',
    width: 800,
    height: 400,
    sourceContext: 'src/app/programs/[id]/page.tsx',
  },
  {
    id: 'an-illustrative-image-for-a-student-project-program-titled-commun',
    prompt: 'an illustrative image for a Student Project program titled "Community Impact Project: Green Tech"',
    width: 800,
    height: 400,
    sourceContext: 'src/app/programs/[id]/page.tsx',
  },
  {
    id: 'an-illustrative-image-for-a-internship-program-titled-software-en',
    prompt: 'an illustrative image for a Internship program titled "Software Engineering Internship"',
    width: 800,
    height: 400,
    sourceContext: 'src/app/programs/[id]/page.tsx',
  },
  {
    id: 'an-illustrative-image-for-a-scholarship-program-titled-innovators',
    prompt: 'an illustrative image for a Scholarship program titled "Innovators Scholarship Fund"',
    width: 800,
    height: 400,
    sourceContext: 'src/app/programs/[id]/page.tsx',
  },
  {
    id: 'an-illustrative-image-representing-a-mentorship-program-related-t',
    prompt: 'an illustrative image representing a Mentorship program, related to AI Mentorship Program',
    width: 300,
    height: 192,
    sourceContext: 'src/components/programs/ProgramCard.tsx',
  },
  {
    id: 'an-illustrative-image-representing-a-student-project-program-rela',
    prompt: 'an illustrative image representing a Student Project program, related to Community Impact Project: Green Tech',
    width: 300,
    height: 192,
    sourceContext: 'src/components/programs/ProgramCard.tsx',
  },
  {
    id: 'an-illustrative-image-representing-a-internship-program-related-t',
    prompt: 'an illustrative image representing a Internship program, related to Software Engineering Internship',
    width: 300,
    height: 192,
    sourceContext: 'src/components/programs/ProgramCard.tsx',
  },
  {
    id: 'an-illustrative-image-representing-a-scholarship-program-related-',
    prompt: 'an illustrative image representing a Scholarship program, related to Innovators Scholarship Fund',
    width: 300,
    height: 192,
    sourceContext: 'src/components/programs/ProgramCard.tsx',
  },
];
