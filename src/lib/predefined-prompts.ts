
/**
 * @fileOverview A list of predefined prompts used for AI image generation.
 * This list helps in pre-generating essential images for the application.
 */

import { sampleTeamMembers, samplePartners, sampleBlogPosts, samplePrograms } from '@/lib/constants';

const aboutPagePrompts: string[] = [
  "a diverse group of people collaborating on a shared mission, conveying vision and teamwork",
];

const teamMemberPrompts: string[] = sampleTeamMembers.map(
  (member) => `an illustrative professional portrait of ${member.name}, ${member.role}`
);

const partnerPrompts: string[] = samplePartners.map(
  (partner) => `a modern, abstract logo for a company named ${partner.name}`
);

const blogHeaderPrompts: string[] = sampleBlogPosts.map(
  (post) => `a header image for a blog post titled "${post.title}"`
);

const blogCardPrompts: string[] = sampleBlogPosts.map(
  (post) => `an engaging image for a blog article titled "${post.title}"`
);

const programDetailPrompts: string[] = samplePrograms.map(
  (program) => `an illustrative image for a ${program.category} program titled "${program.title}"`
);

const programCardPrompts: string[] = samplePrograms.map(
  (program) => `an illustrative image representing a ${program.category} program, related to ${program.title}`
);

const homePagePrompts: string[] = [
    "an abstract network graphic showing four distinct but interconnected pillars, symbolizing a foundation's core components",
    // Note: The "Saleeka Foundation Community" image on homepage uses a static placeholder, so no AI prompt for it.
];


// Combine all prompts and remove duplicates
const allUniquePrompts = Array.from(new Set([
  ...aboutPagePrompts,
  ...teamMemberPrompts,
  ...partnerPrompts,
  ...blogHeaderPrompts,
  ...blogCardPrompts,
  ...programDetailPrompts,
  ...programCardPrompts,
  ...homePagePrompts,
]));

export const predefinedImagePrompts: string[] = allUniquePrompts;

    