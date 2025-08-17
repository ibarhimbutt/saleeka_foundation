// Neo4j Node Labels
export const NODE_LABELS = {
  USER: 'User',
  STUDENT: 'Student',
  MENTOR: 'Mentor',
  ADMIN: 'Admin',
  DONOR: 'Donor',
  ORGANIZATION: 'Organization',
  PROGRAM: 'Program',
  PROJECT: 'Project',
  SKILL: 'Skill',
  INTEREST: 'Interest',
  ACTIVITY: 'Activity',
  SETTINGS: 'Settings',
  MEDIA: 'Media',
} as const;

// Neo4j Relationship Types
export const RELATIONSHIP_TYPES = {
  // User relationships
  HAS_PROFILE: 'HAS_PROFILE',
  HAS_SETTINGS: 'HAS_SETTINGS',
  HAS_ACTIVITY: 'HAS_ACTIVITY',
  
  // Mentorship relationships
  MENTORS: 'MENTORS',
  IS_MENTORED_BY: 'IS_MENTORED_BY',
  MENTORSHIP_REQUEST: 'MENTORSHIP_REQUEST',
  MENTORSHIP_ACTIVE: 'MENTORSHIP_ACTIVE',
  
  // Skill and interest relationships
  HAS_SKILL: 'HAS_SKILL',
  INTERESTED_IN: 'INTERESTED_IN',
  SKILL_LEVEL: 'SKILL_LEVEL',
  
  // Program and project relationships
  ENROLLED_IN: 'ENROLLED_IN',
  CREATED: 'CREATED',
  PARTICIPATES_IN: 'PARTICIPATES_IN',
  APPLIED_TO: 'APPLIED_TO',
  POSTED: 'POSTED',
  
  // Organization relationships
  WORKS_FOR: 'WORKS_FOR',
  MEMBER_OF: 'MEMBER_OF',
  ADMIN_OF: 'ADMIN_OF',
  
  // Media relationships
  HAS_MEDIA: 'HAS_MEDIA',
  GENERATED_BY: 'GENERATED_BY',
  
  // Connection relationships
  CONNECTED_TO: 'CONNECTED_TO',
  FOLLOWS: 'FOLLOWS',
  RECOMMENDED_BY: 'RECOMMENDED_BY',
} as const;

// Base User Node Properties
export interface BaseUserNode {
  uid: string;
  email: string;
  password?: string; // Hashed password for authentication
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  company?: string;
  jobTitle?: string;
  experience?: string;
  education?: string;
  subscribeNewsletter?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  lastLoginAt?: string; // ISO date string
  isActive: boolean;
  isVerified: boolean;
  profileVisibility: 'public' | 'private' | 'members-only';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
}

// Student Node Properties
export interface StudentNode extends BaseUserNode {
  type: 'student';
  role: 'student';
  interests?: string[];
  skills?: string[];
  currentProgram?: string;
  graduationYear?: number;
  major?: string;
  university?: string;
  gpa?: number;
  achievements?: string[];
  goals?: string[];
}

// Mentor Node Properties
export interface MentorNode extends BaseUserNode {
  type: 'mentor';
  role: 'mentor';
  expertise: string[];
  category: string; // Primary category for the mentor
  yearsOfExperience: number;
  industry?: string;
  certifications?: string[];
  availability?: string;
  maxMentees?: number;
  currentMentees?: number;
  rating?: number;
  totalMentees?: number;
  specialties?: string[];
}

// Admin Node Properties
export interface AdminNode extends BaseUserNode {
  type: 'admin';
  role: 'superAdmin' | 'editor' | 'viewer';
  permissions: string[];
  adminLevel: number;
}

// Donor Node Properties
export interface DonorNode extends BaseUserNode {
  type: 'donor';
  role: 'donor';
  donationHistory?: Array<{
    amount: number;
    date: string;
    program?: string;
    anonymous: boolean;
  }>;
  totalDonated?: number;
  preferredPrograms?: string[];
}

// Organization Node Properties
export interface OrganizationNode {
  id: string;
  name: string;
  type: 'nonprofit' | 'corporate' | 'educational' | 'government';
  description?: string;
  website?: string;
  logo?: string;
  location?: string;
  industry?: string;
  size?: string;
  founded?: number;
  mission?: string;
  programs?: string[];
  createdAt: string;
  updatedAt?: string;
}

// Program Node Properties
export interface ProgramNode {
  id: string;
  title: string;
  category: 'Mentorship' | 'Student Project' | 'Internship' | 'Scholarship';
  description: string;
  image?: string;
  tags?: string[];
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  requirements?: string[];
  benefits?: string[];
  applicationDeadline?: string;
  status: 'active' | 'inactive' | 'completed' | 'upcoming';
  createdAt: string;
  updatedAt?: string;
}

// Project Node Properties
export interface ProjectNode {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  location: string;
  duration: string;
  teamSize: number;
  status: 'open' | 'in-progress' | 'completed';
  postedDate: string;
  deadline: string;
  compensation?: string;
  createdAt: string;
  updatedAt?: string;
}

// Skill Node Properties
export interface SkillNode {
  id: string;
  name: string;
  category: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  demand: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Interest Node Properties
export interface InterestNode {
  id: string;
  name: string;
  category: string;
  description?: string;
  popularity: number;
  createdAt: string;
}

// Activity Node Properties
export interface ActivityNode {
  id: string;
  uid: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Settings Node Properties
export interface SettingsNode {
  uid: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  weeklyDigest?: boolean;
  mentorshipNotifications?: boolean;
  projectUpdates?: boolean;
  communityUpdates?: boolean;
  updatedAt: string;
}

// Media Node Properties
export interface MediaNode {
  id: string;
  prompt: string;
  imageUrl: string;
  provider: string;
  promptKey: string;
  imageSizeBytes?: number;
  mimeType?: string;
  generatedBy?: string; // User ID who generated it
  createdAt: string;
}

// Relationship Properties
export interface MentorshipRelationship {
  startDate: string;
  status: 'pending' | 'active' | 'completed' | 'terminated';
  goals?: string[];
  notes?: string[];
  rating?: number;
  feedback?: string;
  lastMeetingDate?: string;
  nextMeetingDate?: string;
}

export interface SkillRelationship {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  certified?: boolean;
  certificationDate?: string;
  lastUsed?: string;
}

export interface ProgramEnrollmentRelationship {
  enrollmentDate: string;
  status: 'enrolled' | 'active' | 'completed' | 'dropped';
  progress?: number;
  grade?: string;
  feedback?: string;
  completionDate?: string;
}

// Graph Query Results
export interface UserWithRelationships {
  user: StudentNode | MentorNode | AdminNode | DonorNode;
  skills: Array<{ skill: SkillNode; relationship: SkillRelationship }>;
  interests: InterestNode[];
  mentors?: Array<{ mentor: MentorNode; relationship: MentorshipRelationship }>;
  mentees?: Array<{ mentee: StudentNode; relationship: MentorshipRelationship }>;
  programs: Array<{ program: ProgramNode; relationship: ProgramEnrollmentRelationship }>;
  activities: ActivityNode[];
  settings?: SettingsNode;
}

export interface MentorshipMatch {
  student: StudentNode;
  mentor: MentorNode;
  compatibilityScore: number;
  commonSkills: string[];
  commonInterests: string[];
  mentorAvailability: string;
  mentorRating: number;
}

// Neo4j Query Result Types
export interface Neo4jRecord<T = any> {
  get(key: string): any;
  toObject(): T;
}

export interface Neo4jResult<T = any> {
  records: Neo4jRecord<T>[];
  summary: any;
}
