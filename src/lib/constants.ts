import { BookOpen, Users, Briefcase, Heart, MessageSquare, Info, Home, Phone } from 'lucide-react';
import type React from 'react';

export type NavLink = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export const navLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About Us', icon: Info },
  { href: '/programs', label: 'Programs', icon: BookOpen },
  { href: '/get-involved', label: 'Get Involved', icon: Users },
  { href: '/blog', label: 'Blog', icon: MessageSquare },
  { href: '/contact', label: 'Contact Us', icon: Phone },
];

export type Program = {
  id: string;
  title: string;
  category: 'Mentorship' | 'Student Project' | 'Internship' | 'Scholarship';
  description: string;
  image?: string;
  tags?: string[];
};

export const samplePrograms: Program[] = [
  {
    id: 'mentorship-tech',
    title: 'Tech Mentorship Program',
    category: 'Mentorship',
    description: 'Connect with experienced tech professionals for guidance and career advice. This program helps students navigate the tech industry, develop skills, and build a strong network.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Tech', 'Career', 'Networking'],
  },
  {
    id: 'project-community-app',
    title: 'Community Connect App',
    category: 'Student Project',
    description: 'Develop a mobile application to connect local community members with resources and events. This is a hands-on project that allows students to apply their coding skills to a real-world problem.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Mobile App', 'Community', 'Development'],
  },
  {
    id: 'internship-marketing',
    title: 'Digital Marketing Internship',
    category: 'Internship',
    description: 'Gain practical experience in digital marketing, including SEO, content creation, and social media management. Work with a dynamic team on exciting campaigns.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Marketing', 'SEO', 'Social Media'],
  },
  {
    id: 'scholarship-stem',
    title: 'STEM Advancement Scholarship',
    category: 'Scholarship',
    description: 'Financial support for students pursuing degrees in Science, Technology, Engineering, and Mathematics. Aimed at fostering innovation and diversity in STEM fields.',
    image: 'https://placehold.co/600x400.png',
    tags: ['STEM', 'Financial Aid', 'Education'],
  },
];

export type BlogPost = {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  tags: string[];
  content?: string; // Full content for single blog post page
};

export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Work: Adapting to New Trends',
    author: 'Dr. Aisha Khan',
    date: 'October 26, 2023',
    excerpt: 'Explore the evolving landscape of work and how students and professionals can prepare for tomorrow\'s challenges.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Future of Work', 'Career Development', 'Technology'],
  },
  {
    id: '2',
    title: 'Unlocking Your Potential Through Mentorship',
    author: 'John Doe',
    date: 'November 5, 2023',
    excerpt: 'Discover the transformative power of mentorship and how Saleeka Foundation connects aspiring individuals with experienced guides.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Mentorship', 'Personal Growth', 'Networking'],
  },
  {
    id: '3',
    title: 'Making an Impact: How Student Projects Shape Communities',
    author: 'Jane Smith',
    date: 'November 12, 2023',
    excerpt: 'Learn about innovative student-led projects facilitated by Saleeka and their positive impact on society.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Student Projects', 'Community Impact', 'Innovation'],
  },
];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

export const sampleTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Fatima Ahmed',
    role: 'Founder & CEO',
    bio: 'Passionate about empowering youth and fostering connections for a better future.',
    imageUrl: 'https://placehold.co/300x300.png',
  },
  {
    id: '2',
    name: 'Ali Raza',
    role: 'Head of Programs',
    bio: 'Dedicated to creating impactful programs that bridge the gap between education and industry.',
    imageUrl: 'https://placehold.co/300x300.png',
  },
  {
    id: '3',
    name: 'Sara Khan',
    role: 'Community Manager',
    bio: 'Focused on building a vibrant and supportive community for all Saleeka members.',
    imageUrl: 'https://placehold.co/300x300.png',
  },
];

export type Partner = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
};

export const samplePartners: Partner[] = [
  {
    id: '1',
    name: 'Innovatech Solutions',
    logoUrl: 'https://placehold.co/150x80.png?text=Innovatech',
    websiteUrl: '#',
  },
  {
    id: '2',
    name: 'Future Leaders Initiative',
    logoUrl: 'https://placehold.co/150x80.png?text=Future+Leaders',
    websiteUrl: '#',
  },
  {
    id: '3',
    name: 'TechSphere Academy',
    logoUrl: 'https://placehold.co/150x80.png?text=TechSphere',
    websiteUrl: '#',
  },
];


export type InvolvementType = {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const involvementTypes: InvolvementType[] = [
  {
    id: 'students',
    title: 'For Students',
    description: 'Register, upload your resume, find projects, and request a mentor to guide your career path.',
    ctaText: 'Register as Student',
    icon: Users,
  },
  {
    id: 'professionals',
    title: 'For Professionals',
    description: 'Become a mentor, share your expertise, post advice, and help shape the next generation of leaders.',
    ctaText: 'Become a Mentor',
    icon: Briefcase,
  },
  {
    id: 'organizations',
    title: 'For Organizations',
    description: 'Post real-world projects, find talented students for internships, and contribute to skill development.',
    ctaText: 'Post a Project',
    icon: Users, // Could be Briefcase too, using Users for consistency
  },
  {
    id: 'donors',
    title: 'For Donors',
    description: 'Support our mission, help us create more opportunities, and view impact reports to see your contribution at work.',
    ctaText: 'Support Us',
    icon: Heart,
  },
];
