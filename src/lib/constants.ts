

import { BookOpen, Users, Briefcase, Heart, MessageSquare, Info, Phone, HomeIcon as Home, LayoutDashboard, Users2, Building2, ImageUp, UserCircle, LogIn, LogOut, ImageIcon } from 'lucide-react';
import type React from 'react';

export type NavLink = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: () => void; // For logout or other actions
};

// Base navigation links visible to everyone
export const navLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About Us', icon: Info },
  { href: '/programs', label: 'Programs', icon: BookOpen },
  { href: '/get-involved', label: 'Get Involved', icon: Users },
  { href: '/blog', label: 'Blog', icon: MessageSquare },
  { href: '/contact', label: 'Contact Us', icon: Phone },
  // Admin link removed, will be added dynamically in Header
];

export type Program = {
  id: string; // Document ID from Firestore
  title: string;
  category: 'Mentorship' | 'Student Project' | 'Internship' | 'Scholarship';
  description: string;
  image?: string; // URL to image in Firebase Storage or placeholder
  tags?: string[];
  // Firestore timestamps will be handled by server-side logic if needed
  // createdAt?: Timestamp; 
  // updatedAt?: Timestamp;
};

export const samplePrograms: Program[] = [
  {
    id: 'prog1',
    title: 'AI Mentorship Program',
    category: 'Mentorship',
    description: 'Connect with experienced AI professionals for guidance and career development. Learn about the latest trends and get personalized advice to navigate your journey in the field of Artificial Intelligence. This program includes one-on-one sessions, workshops, and networking opportunities.',
    image: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Machine Learning', 'Career Growth', 'Networking'],
  },
  {
    id: 'prog2',
    title: 'Community Impact Project: Green Tech',
    category: 'Student Project',
    description: 'Join a team to develop a green technology solution for a local community challenge. This project-based learning experience will allow you to apply your skills in sustainability, engineering, and project management to make a real-world difference. Collaborate with peers and present your solution to stakeholders.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Sustainability', 'Tech for Good', 'Project Management', 'Teamwork'],
  },
  {
    id: 'prog3',
    title: 'Software Engineering Internship',
    category: 'Internship',
    description: 'Gain hands-on experience in a fast-paced tech environment. Work on real software development projects, mentored by senior engineers. This internship offers exposure to the full software development lifecycle, from design to deployment. Enhance your coding skills and build your professional portfolio.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Software Development', 'Internship', 'Tech Skills', 'Full-stack'],
  },
  {
    id: 'prog4',
    title: 'Innovators Scholarship Fund',
    category: 'Scholarship',
    description: 'Apply for the Saleeka Innovators Scholarship, supporting talented students in STEM fields. This scholarship aims to reduce financial barriers and empower the next generation of innovators. Awardees will also receive access to exclusive workshops and networking events.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Scholarship', 'STEM', 'Education', 'Financial Aid'],
  },
];


export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Work: Adapting to New Trends',
    author: 'Dr. Aisha Khan',
    date: 'October 26, 2023',
    excerpt: 'Explore the evolving landscape of work and how students and professionals can prepare for tomorrow\'s challenges.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Future of Work', 'Career Development', 'Technology'],
    content: `The world of work is undergoing a seismic shift. Remote collaboration, AI-driven automation, and the gig economy are no longer futuristic concepts but present-day realities. For students preparing to enter the workforce and professionals looking to stay relevant, adapting to these new trends is crucial. \n\nThis article delves into the key transformations shaping the future of work. We'll discuss the skills that are becoming indispensable, such as digital literacy, emotional intelligence, and continuous learning. Furthermore, we explore strategies for navigating a dynamic career path, embracing lifelong education, and leveraging technology to enhance productivity and well-being. Saleeka Foundation is committed to providing resources and programs that equip individuals with the tools they need to thrive in this new era. We believe that proactive adaptation and a mindset geared towards growth are essential for success in the modern professional landscape.`,
  },
  {
    id: '2',
    title: 'Unlocking Your Potential Through Mentorship',
    author: 'John Doe',
    date: 'November 5, 2023',
    excerpt: 'Discover the transformative power of mentorship and how Saleeka Foundation connects aspiring individuals with experienced guides.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Mentorship', 'Personal Growth', 'Networking'],
    content: `Mentorship is a powerful catalyst for personal and professional growth. Having an experienced guide can provide invaluable insights, support, and encouragement, helping individuals navigate challenges and unlock their full potential. At Saleeka Foundation, we believe deeply in the transformative power of these connections. \n\nOur mentorship programs are designed to pair aspiring talents with seasoned professionals across various industries. This article explores the multifaceted benefits of mentorship, from skill development and network expansion to increased confidence and career clarity. We also share inspiring stories from our community, highlighting how mentorship has made a tangible difference in the lives of both mentors and mentees. Learn how you can get involved, either as a mentor looking to give back or a mentee eager to learn and grow. The journey of development is often accelerated with the wisdom and support of those who have walked the path before.`,
  },
  {
    id: '3',
    title: 'Making an Impact: How Student Projects Shape Communities',
    author: 'Jane Smith',
    date: 'November 12, 2023',
    excerpt: 'Learn about innovative student-led projects facilitated by Saleeka and their positive impact on society.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Student Projects', 'Community Impact', 'Innovation'],
    content: `Student-led projects are more than just academic exercises; they are opportunities for innovation, collaboration, and real-world impact. Saleeka Foundation actively champions initiatives where students can apply their knowledge and skills to address tangible community needs or develop groundbreaking solutions. \n\nThis piece showcases several inspiring projects spearheaded by students within the Saleeka ecosystem. From developing sustainable urban farming solutions to creating educational apps for underserved communities, these initiatives demonstrate the creativity and drive of the next generation. We'll explore the journey of these projects, the challenges overcome, and the lasting positive changes they've brought about. Discover how Saleeka fosters an environment where student innovation can flourish and contribute meaningfully to society. These projects not only benefit the community but also provide students with invaluable experience in project management, teamwork, and problem-solving.`,
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
    name: 'Najam Rashid',
    role: 'Founder & CEO',
    bio: 'Passionate about empowering youth and fostering connections for a better future.',
    imageUrl: 'https://placehold.co/300x300.png',
  },
  {
    id: '2',
    name: 'Iffat Shaheen',
    role: 'Head of Programs',
    bio: 'Dedicated to creating impactful programs that bridge the gap between education and industry.',
    imageUrl: 'https://placehold.co/300x300.png',
  },
  {
    id: '3',
    name: 'Taaha Najam',
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
    icon: Building2,
  },
  {
    id: 'donors',
    title: 'For Donors',
    description: 'Support our mission, help us create more opportunities, and view impact reports to see your contribution at work.',
    ctaText: 'Support Us',
    icon: Heart,
  },
];

// Admin Data Structures and Sample Data (To be replaced by Firestore eventually)

export type StudentProfile = {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  interests: string[];
  resumeUrl?: string;
};

export const sampleStudentProfiles: StudentProfile[] = [
  { id: 'stud1', name: 'Aisha Sharma', email: 'aisha.sharma@example.com', joinDate: '2023-01-15', interests: ['Web Development', 'AI'], resumeUrl: '#' },
  { id: 'stud2', name: 'Ben Carter', email: 'ben.carter@example.com', joinDate: '2023-02-20', interests: ['Mobile Development', 'UX Design'] },
  { id: 'stud3', name: 'Chen Wei', email: 'chen.wei@example.com', joinDate: '2023-03-10', interests: ['Data Science', 'Machine Learning', 'Python'], resumeUrl: '#' },
  { id: 'stud4', name: 'Diana Prince', email: 'diana.prince@example.com', joinDate: '2023-04-05', interests: ['Cybersecurity', 'Network Admin'], resumeUrl: '#' },
];

export type ProfessionalProfile = {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  linkedinUrl?: string;
  bio: string;
};

export const sampleProfessionalProfiles: ProfessionalProfile[] = [
  { id: 'prof1', name: 'Dr. David Lee', email: 'david.lee@example.com', expertise: ['Software Engineering', 'Cloud Computing'], linkedinUrl: '#', bio: 'Experienced software architect with 15+ years in the industry.' },
  { id: 'prof2', name: 'Maria Rodriguez', email: 'maria.rodriguez@example.com', expertise: ['Marketing Strategy', 'Brand Management'], bio: 'Dynamic marketing leader passionate about building brands.' },
  { id: 'prof3', name: 'Samuel Green', email: 'samuel.green@example.com', expertise: ['Product Management', 'Agile Methodologies'], linkedinUrl: '#', bio: 'Product visionary with a track record of successful launches.' },
  { id: 'prof4', name: 'Dr. Evelyn Reed', email: 'evelyn.reed@example.com', expertise: ['Biotechnology', 'Research'], bio: 'Leading researcher in genetic engineering.' },
];

export type OrganizationProfile = {
  id:string;
  name: string;
  contactEmail: string;
  website: string;
  industry: string;
  projectAreas: string[];
  status: 'Active' | 'Pending' | 'Inactive';
};

export const sampleOrganizationProfiles: OrganizationProfile[] = [
  { id: 'org1', name: 'Innovatech Solutions Ltd.', contactEmail: 'contact@innovatech.com', website: 'https://innovatech.com', industry: 'Technology', projectAreas: ['AI Development', 'SaaS Platforms'], status: 'Active' },
  { id: 'org2', name: 'GreenFuture Non-Profit', contactEmail: 'info@greenfuture.org', website: 'https://greenfuture.org', industry: 'Environmental', projectAreas: ['Sustainability Projects', 'Community Workshops'], status: 'Active' },
  { id: 'org3', name: 'HealthWell Corp', contactEmail: 'partner@healthwell.com', website: 'https://healthwell.com', industry: 'Healthcare', projectAreas: ['Medical Research', 'App Development'], status: 'Pending' },
  { id: 'org4', name: 'EduGrowth Foundation', contactEmail: 'connect@edugrowth.org', website: 'https://edugrowth.org', industry: 'Education', projectAreas: ['Curriculum Development', 'EdTech'], status: 'Active'},
];

export type DonorProfile = {
  id: string;
  name: string;
  email?: string;
  donationDate: string;
  amount: number;
  type: 'Individual' | 'Corporate';
  status: 'Processed' | 'Pending';
};

export const sampleDonorProfiles: DonorProfile[] = [
  { id: 'donor1', name: 'Alice Wonderland', email: 'alice.w@example.com', donationDate: '2023-04-01', amount: 500, type: 'Individual', status: 'Processed' },
  { id: 'donor2', name: 'TechCorp Inc.', email: 'giving@techcorp.com', donationDate: '2023-05-15', amount: 10000, type: 'Corporate', status: 'Processed' },
  { id: 'donor3', name: 'Anonymous Giver', donationDate: '2023-06-01', amount: 100, type: 'Individual', status: 'Pending' },
  { id: 'donor4', name: 'Bob Johnson', email: 'bob.j@example.com', donationDate: '2023-07-20', amount: 250, type: 'Individual', status: 'Processed' },
];

// For Admin Sidebar
export const adminNavLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users2 },
  { href: '/admin/professionals', label: 'Professionals', icon: Briefcase },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/donors', label: 'Donors', icon: Heart },
  { href: '/admin/pregenerated-images', label: 'Manage Images', icon: ImageIcon },
  { href: '/admin/image-regeneration', label: 'Force Regenerate', icon: ImageUp },
];


export type BlogPost = {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  tags: string[];
  content?: string;
};


    
