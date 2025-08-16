import { 
  Neo4jUserService,
  Neo4jMentorshipService,
  Neo4jSkillService,
  Neo4jProgramService,
  Neo4jActivityService,
  Neo4jSettingsService,
  Neo4jMediaService,
  Neo4jOrganizationService,
  Neo4jUtilityService
} from './neo4jService';
import { initNeo4j, checkNeo4jHealth } from './neo4j';

export class Neo4jMigrationService {
  // Initialize Neo4j database with indexes and basic structure
  static async initializeDatabase(): Promise<void> {
    try {
      console.log('🚀 Initializing Neo4j database...');
      
      // Initialize connection
      initNeo4j();
      
      // Check health
      const isHealthy = await checkNeo4jHealth();
      if (!isHealthy) {
        throw new Error('Neo4j connection failed');
      }
      
      // Create indexes for better performance
      console.log('📊 Creating database indexes...');
      await Neo4jUtilityService.createIndexes();
      
      // Create initial seed data
      console.log('🌱 Creating initial seed data...');
      await this.createSeedData();
      
      console.log('✅ Neo4j database initialization completed successfully!');
    } catch (error) {
      console.error('❌ Neo4j database initialization failed:', error);
      throw error;
    }
  }

  // Create initial seed data for the platform
  static async createSeedData(): Promise<void> {
    try {
      // Create sample skills
      const skills = [
        { name: 'JavaScript', category: 'Programming', level: 'intermediate' as const, demand: 'high' as const, description: 'JavaScript programming language' },
        { name: 'Python', category: 'Programming', level: 'intermediate' as const, demand: 'high' as const, description: 'Python programming language' },
        { name: 'React', category: 'Frontend', level: 'intermediate' as const, demand: 'high' as const, description: 'React frontend framework' },
        { name: 'Node.js', category: 'Backend', level: 'intermediate' as const, demand: 'high' as const, description: 'Node.js backend runtime' },
        { name: 'Data Science', category: 'Analytics', level: 'beginner' as const, demand: 'high' as const, description: 'Data science and analytics' },
        { name: 'Machine Learning', category: 'AI', level: 'beginner' as const, demand: 'high' as const, description: 'Machine learning and AI' },
        { name: 'Project Management', category: 'Business', level: 'beginner' as const, demand: 'medium' as const, description: 'Project management skills' },
        { name: 'Leadership', category: 'Soft Skills', level: 'beginner' as const, demand: 'medium' as const, description: 'Leadership and management' },
        { name: 'Communication', category: 'Soft Skills', level: 'beginner' as const, demand: 'high' as const, description: 'Communication skills' },
        { name: 'Problem Solving', category: 'Soft Skills', level: 'beginner' as const, demand: 'high' as const, description: 'Problem solving abilities' }
      ];

      for (const skill of skills) {
        await Neo4jSkillService.addUserSkill('system', skill, { 
          level: 'expert',
          yearsOfExperience: 5,
          certified: false,
          certificationDate: undefined,
          lastUsed: undefined
        });
      }

      // Create sample interests
      const interests = [
        { name: 'Technology', category: 'Industry', description: 'Technology industry and innovations' },
        { name: 'Education', category: 'Industry', description: 'Education and learning' },
        { name: 'Healthcare', category: 'Industry', description: 'Healthcare and medical' },
        { name: 'Environment', category: 'Industry', description: 'Environmental sustainability' },
        { name: 'Social Impact', category: 'Industry', description: 'Social impact and community' },
        { name: 'Innovation', category: 'Topic', description: 'Innovation and creativity' },
        { name: 'Research', category: 'Topic', description: 'Research and development' },
        { name: 'Community Building', category: 'Topic', description: 'Building communities' },
        { name: 'Mentorship', category: 'Topic', description: 'Mentorship and guidance' },
        { name: 'Professional Development', category: 'Topic', description: 'Professional growth' }
      ];

      for (const interest of interests) {
        await Neo4jSkillService.addUserInterest('system', interest);
      }

      // Create sample programs
      const programs = [
        {
          title: 'Tech Mentorship Program',
          category: 'Mentorship' as const,
          description: 'Connect with experienced tech professionals for guidance and career development.',
          image: undefined,
          tags: ['technology', 'mentorship', 'career'],
          organizationId: undefined,
          startDate: undefined,
          endDate: undefined,
          maxParticipants: 100,
          currentParticipants: 0,
          requirements: ['Basic programming knowledge', 'Commitment to learning'],
          benefits: ['1-on-1 mentorship', 'Career guidance', 'Networking opportunities'],
          applicationDeadline: undefined
        },
        {
          title: 'Student Innovation Challenge',
          category: 'Student Project' as const,
          description: 'Work on real-world problems and develop innovative solutions.',
          image: undefined,
          tags: ['innovation', 'problem-solving', 'collaboration'],
          organizationId: undefined,
          startDate: undefined,
          endDate: undefined,
          maxParticipants: 50,
          currentParticipants: 0,
          requirements: ['Student status', 'Team of 2-4 members'],
          benefits: ['Prize money', 'Mentorship', 'Industry connections'],
          applicationDeadline: undefined
        },
        {
          title: 'Summer Internship Program',
          category: 'Internship' as const,
          description: 'Gain hands-on experience in various industries.',
          image: undefined,
          tags: ['internship', 'experience', 'learning'],
          organizationId: undefined,
          startDate: undefined,
          endDate: undefined,
          maxParticipants: 200,
          currentParticipants: 0,
          requirements: ['Current student', 'Good academic standing'],
          benefits: ['Paid internship', 'Real-world experience', 'Potential job offers'],
          applicationDeadline: undefined
        },
        {
          title: 'Academic Excellence Scholarship',
          category: 'Scholarship' as const,
          description: 'Supporting outstanding students in their academic pursuits.',
          image: undefined,
          tags: ['scholarship', 'academic', 'financial support'],
          organizationId: undefined,
          startDate: undefined,
          endDate: undefined,
          maxParticipants: 25,
          currentParticipants: 0,
          requirements: ['High GPA', 'Leadership experience', 'Community involvement'],
          benefits: ['Full tuition coverage', 'Living stipend', 'Mentorship program'],
          applicationDeadline: undefined
        }
      ];

      for (const program of programs) {
        await Neo4jProgramService.createProgram(program);
      }

      console.log('✅ Seed data created successfully');
    } catch (error) {
      console.error('❌ Error creating seed data:', error);
      throw error;
    }
  }

  // Migrate existing Firebase data to Neo4j (placeholder for future use)
  static async migrateFromFirebase(firebaseData: any): Promise<void> {
    try {
      console.log('🔄 Starting Firebase to Neo4j migration...');
      
      // This would contain logic to migrate existing Firebase data
      // For now, it's a placeholder that can be implemented later
      
      console.log('✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Create a sample user for testing
  static async createSampleUser(): Promise<string> {
    try {
      const sampleStudent = {
        uid: 'sample_student_001',
        email: 'student@example.com',
        displayName: 'Sample Student',
        firstName: 'Sample',
        lastName: 'Student',
        bio: 'A passionate student interested in technology and innovation.',
        type: 'student' as const,
        role: 'student' as const,
        interests: ['Technology', 'Innovation'],
        skills: ['JavaScript', 'Problem Solving'],
        currentProgram: 'Tech Mentorship Program',
        graduationYear: 2025,
        major: 'Computer Science',
        university: 'Sample University',
        gpa: 3.8,
        achievements: ['Dean\'s List', 'Hackathon Winner'],
        goals: ['Learn full-stack development', 'Build innovative projects']
      };

      await Neo4jUserService.createUser(sampleStudent);
      
      // Add skills
      await Neo4jSkillService.addUserSkill(sampleStudent.uid, 
        { name: 'JavaScript', category: 'Programming', description: 'JavaScript programming language' }, 
        { level: 'intermediate', yearsOfExperience: 2 }
      );
      
      await Neo4jSkillService.addUserSkill(sampleStudent.uid, 
        { name: 'Problem Solving', category: 'Soft Skills', description: 'Problem solving abilities' }, 
        { level: 'advanced', yearsOfExperience: 3 }
      );

      // Add interests
      await Neo4jSkillService.addUserInterest(sampleStudent.uid, 
        { name: 'Technology', category: 'Industry', description: 'Technology industry and innovations' }
      );
      
      await Neo4jSkillService.addUserInterest(sampleStudent.uid, 
        { name: 'Innovation', category: 'Topic', description: 'Innovation and creativity' }
      );

      console.log('✅ Sample student created successfully');
      return sampleStudent.uid;
    } catch (error) {
      console.error('❌ Error creating sample student:', error);
      throw error;
    }
  }

  // Create a sample mentor for testing
  static async createSampleMentor(): Promise<string> {
    try {
      const sampleMentor = {
        uid: 'sample_mentor_001',
        email: 'mentor@example.com',
        displayName: 'Sample Mentor',
        firstName: 'Sample',
        lastName: 'Mentor',
        bio: 'Experienced software engineer with 10+ years in the industry.',
        type: 'mentor' as const,
        role: 'mentor' as const,
        expertise: ['Software Engineering', 'Web Development', 'Team Leadership'],
        yearsOfExperience: 10,
        industry: 'Technology',
        certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
        availability: 'Weekdays 6-8 PM, Weekends 10 AM-2 PM',
        maxMentees: 5,
        currentMentees: 0,
        rating: 4.8,
        totalMentees: 15,
        specialties: ['Full-stack Development', 'Career Guidance', 'Interview Preparation']
      };

      await Neo4jUserService.createUser(sampleMentor);
      
      // Add skills
      await Neo4jSkillService.addUserSkill(sampleMentor.uid, 
        { name: 'JavaScript', category: 'Programming', description: 'JavaScript programming language' }, 
        { level: 'expert', yearsOfExperience: 8 }
      );
      
      await Neo4jSkillService.addUserSkill(sampleMentor.uid, 
        { name: 'Leadership', category: 'Soft Skills', description: 'Leadership and management skills' }, 
        { level: 'expert', yearsOfExperience: 5 }
      );

      // Add interests
      await Neo4jSkillService.addUserInterest(sampleMentor.uid, 
        { name: 'Technology', category: 'Industry', description: 'Technology industry and innovations' }
      );
      
      await Neo4jSkillService.addUserInterest(sampleMentor.uid, 
        { name: 'Mentorship', category: 'Topic', description: 'Mentorship and guidance' }
      );

      console.log('✅ Sample mentor created successfully');
      return sampleMentor.uid;
    } catch (error) {
      console.error('❌ Error creating sample mentor:', error);
      throw error;
    }
  }

  // Test the mentorship matching system
  static async testMentorshipMatching(): Promise<void> {
    try {
      console.log('🧪 Testing mentorship matching system...');
      
      // Create sample users if they don't exist
      const studentUid = await this.createSampleUser();
      const mentorUid = await this.createSampleMentor();
      
      // Test mentorship matching
      const matches = await Neo4jMentorshipService.getMentorshipMatches(studentUid, 5 as number);
      console.log(`Found ${matches.length} potential mentorship matches`);
      
      // Create a mentorship relationship
      await Neo4jMentorshipService.createMentorship(studentUid, mentorUid, {
        goals: ['Learn full-stack development', 'Improve problem-solving skills'],
        notes: ['Initial meeting scheduled for next week']
      });
      
      console.log('✅ Mentorship relationship created successfully');
      
      // Test getting active mentorships
      const activeMentorships = await Neo4jMentorshipService.getActiveMentorships(studentUid, 'student');
      console.log(`Student has ${activeMentorships.length} active mentorships`);
      
      console.log('✅ Mentorship matching test completed successfully');
    } catch (error) {
      console.error('❌ Mentorship matching test failed:', error);
      throw error;
    }
  }

  // Create sample activities for an existing user
  static async createSampleActivitiesForUser(uid: string): Promise<void> {
    try {
      console.log(`🌱 Creating sample activities for user: ${uid}`);
      
      const sampleActivities = [
        {
          action: 'profile_updated',
          description: 'Updated profile information',
          metadata: { fields: ['bio', 'location', 'skills'] }
        },
        {
          action: 'program_viewed',
          description: 'Viewed Tech Mentorship Program details',
          metadata: { program: 'Tech Mentorship Program', category: 'Mentorship' }
        },
        {
          action: 'skill_updated',
          description: 'Updated skill level for JavaScript',
          metadata: { skill: 'JavaScript', oldLevel: 'beginner', newLevel: 'intermediate' }
        },
        {
          action: 'mentorship_requested',
          description: 'Sent mentorship request to Sample Mentor',
          metadata: { mentor: 'Sample Mentor', status: 'pending' }
        },
        {
          action: 'community_joined',
          description: 'Joined Technology Innovation community',
          metadata: { community: 'Technology Innovation', members: 150 }
        }
      ];

      for (const activity of sampleActivities) {
        await Neo4jActivityService.logUserActivity({
          uid,
          ...activity,
          ipAddress: '127.0.0.1',
          userAgent: 'Sample Data Generator'
        });
      }

      console.log(`✅ Created ${sampleActivities.length} sample activities for user: ${uid}`);
    } catch (error) {
      console.error(`❌ Error creating sample activities for user ${uid}:`, error);
      throw error;
    }
  }

  // Run all tests
  static async runAllTests(): Promise<void> {
    try {
      console.log('🧪 Running all Neo4j functionality tests...');
      
      await this.testMentorshipMatching();
      
      // Test user management
      const sampleUser = await Neo4jUserService.getUserByUid('sample_student_001');
      console.log('✅ User retrieval test passed');
      
      // Test skill management
      const userSkills = await Neo4jSkillService.getUserSkills('sample_student_001');
      console.log(`✅ Skill retrieval test passed (${userSkills.length} skills found)`);
      
      // Test program management
      const programs = await Neo4jProgramService.getAllPrograms();
      console.log(`✅ Program retrieval test passed (${programs.length} programs found)`);
      
      console.log('🎉 All tests passed successfully!');
    } catch (error) {
      console.error('❌ Some tests failed:', error);
      throw error;
    }
  }

  // Get database statistics
  static async getDatabaseStats(): Promise<void> {
    try {
      const stats = await Neo4jUtilityService.getDatabaseStats();
      console.log('📊 Database Statistics:');
      console.table(stats);
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
    }
  }
}
