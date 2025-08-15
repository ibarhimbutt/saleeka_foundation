import { 
  executeRead, 
  executeWrite, 
  executeTransaction,
  getSession 
} from './neo4j';
import {
  NODE_LABELS,
  RELATIONSHIP_TYPES,
  type StudentNode,
  type MentorNode,
  type ProfessionalNode,
  type AdminNode,
  type DonorNode,
  type OrganizationNode,
  type ProgramNode,
  type SkillNode,
  type InterestNode,
  type ActivityNode,
  type SettingsNode,
  type MediaNode,
  type UserWithRelationships,
  type MentorshipMatch,
  type MentorshipRelationship,
  type SkillRelationship,
  type ProgramEnrollmentRelationship
} from './neo4jTypes';

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export class Neo4jUserService {
  // Create a new user node
  static async createUser(userData: Partial<StudentNode | MentorNode | ProfessionalNode | AdminNode | DonorNode>): Promise<void> {
    const now = new Date().toISOString();
    const userType = userData.type || 'student';
    
    // Map user type to proper Neo4j node label
    const getNodeLabel = (type: string) => {
      switch (type) {
        case 'student':
          return 'Student';
        case 'mentor':
          return 'Mentor';
        case 'professional':
          return 'Professional';
        case 'admin':
          return 'Admin';
        case 'donor':
          return 'Donor';
        default:
          return 'Student';
      }
    };
    
    const label = getNodeLabel(userType);
    
    const query = `
      CREATE (u:${label}:User {
        uid: $uid,
        email: $email,
        password: $password,
        displayName: $displayName,
        firstName: $firstName,
        lastName: $lastName,
        photoURL: $photoURL,
        bio: $bio,
        phone: $phone,
        location: $location,
        website: $website,
        linkedinUrl: $linkedinUrl,
        githubUrl: $githubUrl,
        twitterUrl: $twitterUrl,
        company: $company,
        jobTitle: $jobTitle,
        experience: $experience,
        education: $education,
        subscribeNewsletter: $subscribeNewsletter,
        emailNotifications: $emailNotifications,
        pushNotifications: $pushNotifications,
        marketingEmails: $marketingEmails,
        createdAt: $createdAt,
        updatedAt: $updatedAt,
        lastLoginAt: $lastLoginAt,
        isActive: $isActive,
        isVerified: $isVerified,
        profileVisibility: $profileVisibility,
        showEmail: $showEmail,
        showPhone: $showPhone,
        showLocation: $showLocation,
        type: $type,
        role: $role
      })
    `;

    const params = {
      uid: userData.uid || '',
      email: userData.email || '',
      password: userData.password || null,
      displayName: userData.displayName || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      photoURL: userData.photoURL || null,
      bio: userData.bio || null,
      phone: userData.phone || null,
      location: userData.location || null,
      website: userData.website || null,
      linkedinUrl: userData.linkedinUrl || null,
      githubUrl: userData.githubUrl || null,
      twitterUrl: userData.twitterUrl || null,
      company: userData.company || null,
      jobTitle: userData.jobTitle || null,
      experience: userData.experience || null,
      education: userData.education || null,
      subscribeNewsletter: userData.subscribeNewsletter || false,
      emailNotifications: userData.emailNotifications || false,
      pushNotifications: userData.pushNotifications || false,
      marketingEmails: userData.marketingEmails || false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      isActive: userData.isActive ?? true,
      isVerified: userData.isVerified ?? false,
      profileVisibility: userData.profileVisibility ?? 'public',
      showEmail: userData.showEmail ?? false,
      showPhone: userData.showPhone ?? false,
      showLocation: userData.showLocation ?? true,
      type: userType,
      role: userData.role || userType
    };

    // Ensure all parameters are primitive values for Neo4j compatibility
    const sanitizedParams = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key, 
        value === null ? null : 
        value === undefined ? null : 
        typeof value === 'object' ? JSON.stringify(value) : 
        value
      ])
    );

    console.log('Executing Neo4j query with params:', sanitizedParams);
    await executeWrite(query, sanitizedParams);
  }

  // Get user by UID
  static async getUserByUid(uid: string): Promise<StudentNode | MentorNode | ProfessionalNode | AdminNode | DonorNode | null> {
    const query = `
      MATCH (u:User {uid: $uid})
      RETURN u
    `;

    const result = await executeRead(query, { uid });
    
    if (result.length > 0) {
      const neo4jNode = (result[0] as { [key: string]: any }).u;
      
      // Extract properties from Neo4j Node object
      if (neo4jNode && neo4jNode.properties) {
        return neo4jNode.properties;
      }
    }
    
    return null;
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<StudentNode | MentorNode | ProfessionalNode | AdminNode | DonorNode | null> {
    const query = `
      MATCH (u:User {email: $email})
      RETURN u
    `;

    console.log('getUserByEmail - Query:', query);
    console.log('getUserByEmail - Email parameter:', email);
    
    const result = await executeRead(query, { email });
    console.log('getUserByEmail - Raw result:', result);
    
    if (result.length > 0) {
      const neo4jNode = (result[0] as { [key: string]: any }).u;
      console.log('getUserByEmail - Extracted Neo4j node:', neo4jNode);
      
      // Extract properties from Neo4j Node object
      if (neo4jNode && neo4jNode.properties) {
        const user = neo4jNode.properties;
        console.log('getUserByEmail - Extracted user properties:', user);
        return user;
      } else {
        console.log('getUserByEmail - Neo4j node missing properties');
        return null;
      }
    }
    
    console.log('getUserByEmail - No user found');
    return null;
  }

  // Get user with all relationships
  static async getUserWithRelationships(uid: string): Promise<UserWithRelationships | null> {
    const query = `
      MATCH (u:User {uid: $uid})
      OPTIONAL MATCH (u)-[r1:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (u)-[r2:INTERESTED_IN]->(i:Interest)
      OPTIONAL MATCH (u)-[r3:IS_MENTORED_BY]->(m:Mentor)
      OPTIONAL MATCH (u)-[r4:MENTORS]->(st:Student)
      OPTIONAL MATCH (u)-[r5:ENROLLED_IN]->(p:Program)
      OPTIONAL MATCH (u)-[r6:HAS_ACTIVITY]->(a:Activity)
      OPTIONAL MATCH (u)-[r7:HAS_SETTINGS]->(set:Settings)
      RETURN u, 
             collect(DISTINCT {skill: s, relationship: r1}) as skills,
             collect(DISTINCT i) as interests,
             collect(DISTINCT {mentor: m, relationship: r3}) as mentors,
             collect(DISTINCT {mentee: st, relationship: r4}) as mentees,
             collect(DISTINCT {program: p, relationship: r5}) as programs,
             collect(DISTINCT a) as activities,
             collect(DISTINCT set)[0] as settings
    `;

    const result = await executeRead(query, { uid });
    
    if (result.length > 0) {
      const record = result[0] as any;
      
      // Extract properties from Neo4j Node objects
      const user = record.u && record.u.properties ? record.u.properties : record.u;
      const skills = record.skills?.map((s: any) => ({
        skill: s.skill && s.skill.properties ? s.skill.properties : s.skill,
        relationship: s.relationship && s.relationship.properties ? s.relationship.properties : s.relationship
      })) || [];
      const interests = record.interests?.map((i: any) => i.properties || i) || [];
      const mentors = record.mentors?.map((m: any) => ({
        mentor: m.mentor && m.mentor.properties ? m.mentor.properties : m.mentor,
        relationship: m.relationship && m.relationship.properties ? m.relationship.properties : m.relationship
      })) || [];
      const mentees = record.mentees?.map((st: any) => ({
        mentee: st.mentee && st.mentee.properties ? st.mentee.properties : st.mentee,
        relationship: st.relationship && st.relationship.properties ? st.relationship.properties : st.relationship
      })) || [];
      const programs = record.programs?.map((p: any) => ({
        program: p.program && p.program.properties ? p.program.properties : p.program,
        relationship: p.relationship && p.relationship.properties ? p.relationship.properties : p.relationship
      })) || [];
      const activities = record.activities?.map((a: any) => a.properties || a) || [];
      const settings = record.settings && record.settings.properties ? record.settings.properties : record.settings;
      
      return {
        user,
        skills,
        interests,
        mentors,
        mentees,
        programs,
        activities,
        settings
      };
    }
    
    return null;
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<StudentNode | MentorNode | ProfessionalNode | AdminNode | DonorNode>): Promise<void> {
    const now = new Date().toISOString();
    const setClause = Object.keys(updates)
      .map(key => `u.${key} = $${key}`)
      .join(', ');

    if (!setClause) {
      // Nothing to update
      return;
    }

    const query = `
      MATCH (u:User {uid: $uid})
      SET ${setClause}, u.updatedAt = $updatedAt
    `;

    await executeWrite(query, { uid, ...updates, updatedAt: now });
  }

  // Delete user
  static async deleteUser(uid: string): Promise<void> {
    const query = `
      MATCH (u:User {uid: $uid})
      DETACH DELETE u
    `;

    await executeWrite(query, { uid });
  }

  // Get all users by type
  static async getUsersByType(type: string): Promise<Array<StudentNode | MentorNode | ProfessionalNode | AdminNode | DonorNode>> {
    const query = `
      MATCH (u:User {type: $type})
      RETURN u
    `;

    const result = await executeRead(query, { type });
    return result.map((record: unknown) => {
      const neo4jNode = (record as { [key: string]: any }).u;
      return neo4jNode && neo4jNode.properties ? neo4jNode.properties : neo4jNode;
    });
  }

  // Search users
  static async searchUsers(searchTerm: string, userType?: string): Promise<Array<StudentNode | MentorNode | ProfessionalNode | AdminNode | DonorNode>> {
    let query = `
      MATCH (u:User)
      WHERE u.displayName CONTAINS $searchTerm 
         OR u.firstName CONTAINS $searchTerm 
         OR u.lastName CONTAINS $searchTerm 
         OR u.bio CONTAINS $searchTerm
    `;

    const params: any = { searchTerm };
    if (userType) {
      query += ` AND u.type = $userType`;
      params.userType = userType;
    }

    query += ` RETURN u LIMIT 50`;

    const result = await executeRead(query, params);
    return result.map((record: unknown) => {
      const neo4jNode = (record as { [key: string]: any }).u;
      return neo4jNode && neo4jNode.properties ? neo4jNode.properties : neo4jNode;
    });
  }
}

// ============================================================================
// MENTORSHIP MANAGEMENT
// ============================================================================

export class Neo4jMentorshipService {
  // Create mentorship relationship
  static async createMentorship(studentUid: string, mentorUid: string, relationshipData: Partial<MentorshipRelationship>): Promise<void> {
    const now = new Date().toISOString();
    
    const query = `
      MATCH (s:Student {uid: $studentUid})
      MATCH (m:Mentor {uid: $mentorUid})
      CREATE (s)-[r:IS_MENTORED_BY {
        startDate: $startDate,
        status: $status,
        goals: $goals,
        notes: $notes,
        rating: $rating,
        feedback: $feedback,
        lastMeetingDate: $lastMeetingDate,
        nextMeetingDate: $nextMeetingDate
      }]->(m)
      CREATE (m)-[r2:MENTORS {
        startDate: $startDate,
        status: $status,
        goals: $goals,
        notes: $notes,
        rating: $rating,
        feedback: $feedback,
        lastMeetingDate: $lastMeetingDate,
        nextMeetingDate: $nextMeetingDate
      }]->(s)
    `;

    const params = {
      studentUid,
      mentorUid,
      startDate: now,
      status: 'pending',
      goals: relationshipData.goals || [],
      notes: relationshipData.notes || [],
      rating: relationshipData.rating || null,
      feedback: relationshipData.feedback || null,
      lastMeetingDate: relationshipData.lastMeetingDate || null,
      nextMeetingDate: relationshipData.nextMeetingDate || null
    };

    await executeWrite(query, params);
  }

  // Get mentorship matches for a student
  static async getMentorshipMatches(studentUid: string, limit: number = 10): Promise<MentorshipMatch[]> {
    // Ensure limit is an integer
    const limitInt = Math.floor(limit);
    const query = `
      MATCH (s:Student {uid: $studentUid})
      MATCH (m:Mentor)
      WHERE m.isActive = true AND m.currentMentees < m.maxMentees
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(ss:Skill)
      OPTIONAL MATCH (m)-[:HAS_SKILL]->(ms:Skill)
      OPTIONAL MATCH (s)-[:INTERESTED_IN]->(si:Interest)
      OPTIONAL MATCH (m)-[:INTERESTED_IN]->(mi:Interest)
      WITH s, m, 
           collect(DISTINCT ss.name) as studentSkills,
           collect(DISTINCT ms.name) as mentorSkills,
           collect(DISTINCT si.name) as studentInterests,
           collect(DISTINCT mi.name) as mentorInterests
      WHERE size([skill IN studentSkills WHERE skill IN mentorSkills]) > 0
         OR size([interest IN studentInterests WHERE interest IN mentorInterests]) > 0
      RETURN s as student, m as mentor,
             size([skill IN studentSkills WHERE skill IN mentorSkills]) as commonSkillsCount,
             size([interest IN studentInterests WHERE interest IN mentorInterests]) as commonInterestsCount,
             studentSkills, mentorSkills, studentInterests, mentorInterests,
             m.rating as mentorRating,
             m.availability as mentorAvailability
      ORDER BY commonSkillsCount + commonInterestsCount DESC, mentorRating DESC
      LIMIT ${limitInt}
    `;

    const result = await executeRead(query, { studentUid });
    
    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      return {
        student: rec.student && rec.student.properties ? rec.student.properties : rec.student,
        mentor: rec.mentor && rec.mentor.properties ? rec.mentor.properties : rec.mentor,
        compatibilityScore: (rec.commonSkillsCount ?? 0) + (rec.commonInterestsCount ?? 0),
        commonSkills: Array.isArray(rec.studentSkills) && Array.isArray(rec.mentorSkills)
          ? rec.studentSkills.filter((skill: string) => rec.mentorSkills.includes(skill))
          : [],
        commonInterests: Array.isArray(rec.studentInterests) && Array.isArray(rec.mentorInterests)
          ? rec.studentInterests.filter((interest: string) => rec.mentorInterests.includes(interest))
          : [],
        mentorAvailability: rec.mentorAvailability,
        mentorRating: rec.mentorRating || 0
      };
    });
  }

  // Get active mentorships for a user
  static async getActiveMentorships(uid: string, userType: 'student' | 'mentor'): Promise<MentorshipRelationship[]> {
    const relationshipType = userType === 'student' ? 'IS_MENTORED_BY' : 'MENTORS';
    
    const query = `
      MATCH (u:User {uid: $uid})-[r:${relationshipType}]-(other:User)
      WHERE r.status = 'active'
      RETURN r, other
    `;

    const result = await executeRead(query, { uid });
    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      return { 
        ...(rec.r && rec.r.properties ? rec.r.properties : rec.r), 
        otherUser: rec.other && rec.other.properties ? rec.other.properties : rec.other 
      };
    });
  }

  // Update mentorship status
  static async updateMentorshipStatus(studentUid: string, mentorUid: string, status: string, updates?: Partial<MentorshipRelationship>): Promise<void> {
    let setUpdates = '';
    if (updates && Object.keys(updates).length > 0) {
      setUpdates = Object.keys(updates)
        .map(key => `, r.${key} = $${key}, r2.${key} = $${key}`)
        .join('');
    }
    const query = `
      MATCH (s:Student {uid: $studentUid})-[r:IS_MENTORED_BY]->(m:Mentor {uid: $mentorUid})
      MATCH (m)-[r2:MENTORS]->(s)
      SET r.status = $status, r2.status = $status${setUpdates}
    `;

    await executeWrite(query, { studentUid, mentorUid, status, ...(updates || {}) });
  }
}

// ============================================================================
// SKILLS AND INTERESTS
// ============================================================================

export class Neo4jSkillService {
  // Add skill to user
  static async addUserSkill(uid: string, skillData: Partial<SkillNode>, relationshipData: Partial<SkillRelationship>): Promise<void> {
    const now = new Date().toISOString();
    
    const query = `
      MERGE (s:Skill {name: $skillName})
      ON CREATE SET s.id = randomUUID(), s.category = $category, s.description = $description, s.level = $level, s.demand = $demand, s.createdAt = $createdAt
      WITH s
      MATCH (u:User {uid: $uid})
      MERGE (u)-[r:HAS_SKILL]->(s)
      SET r.level = $skillLevel, r.yearsOfExperience = $yearsOfExperience, r.certified = $certified, r.certificationDate = $certificationDate, r.lastUsed = $lastUsed
    `;

    const params = {
      uid,
      skillName: skillData.name,
      category: skillData.category || 'general',
      description: skillData.description || '',
      level: skillData.level || 'beginner',
      demand: skillData.demand || 'medium',
      createdAt: now,
      skillLevel: relationshipData.level || 'beginner',
      yearsOfExperience: relationshipData.yearsOfExperience || 0,
      certified: relationshipData.certified || false,
      certificationDate: relationshipData.certificationDate || null,
      lastUsed: relationshipData.lastUsed || null
    };

    await executeWrite(query, params);
  }

  // Get user skills
  static async getUserSkills(uid: string): Promise<Array<{ skill: SkillNode; relationship: SkillRelationship }>> {
    const query = `
      MATCH (u:User {uid: $uid})-[r:HAS_SKILL]->(s:Skill)
      RETURN s as skill, r as relationship
    `;

    const result = await executeRead(query, { uid });
    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      return { 
        skill: rec.skill && rec.skill.properties ? rec.skill.properties : rec.skill,
        relationship: rec.relationship && rec.relationship.properties ? rec.relationship.properties : rec.relationship
      };
    });
  }

  // Add interest to user
  static async addUserInterest(uid: string, interestData: Partial<InterestNode>): Promise<void> {
    const now = new Date().toISOString();
    
    const query = `
      MERGE (i:Interest {name: $interestName})
      ON CREATE SET i.id = randomUUID(), i.category = $category, i.description = $description, i.popularity = 1, i.createdAt = $createdAt
      ON MATCH SET i.popularity = i.popularity + 1
      WITH i
      MATCH (u:User {uid: $uid})
      MERGE (u)-[:INTERESTED_IN]->(i)
    `;

    const params = {
      uid,
      interestName: interestData.name,
      category: interestData.category || 'general',
      description: interestData.description,
      createdAt: now
    };

    await executeWrite(query, params);
  }

  // Get user interests
  static async getUserInterests(uid: string): Promise<InterestNode[]> {
    const query = `
      MATCH (u:User {uid: $uid})-[r:INTERESTED_IN]->(i:Interest)
      RETURN i
    `;

    const result = await executeRead(query, { uid });
    return result.map((record: unknown) => {
      const interest = (record as { [key: string]: any }).i;
      return interest && interest.properties ? interest.properties : interest;
    });
  }
}

// ============================================================================
// PROGRAMS AND PROJECTS
// ============================================================================

export class Neo4jProgramService {
  // Create program
  static async createProgram(programData: Partial<ProgramNode>): Promise<string> {
    const now = new Date().toISOString();
    const programId = `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      CREATE (p:Program {
        id: $id,
        title: $title,
        category: $category,
        description: $description,
        image: $image,
        tags: $tags,
        organizationId: $organizationId,
        startDate: $startDate,
        endDate: $endDate,
        maxParticipants: $maxParticipants,
        currentParticipants: $currentParticipants,
        requirements: $requirements,
        benefits: $benefits,
        applicationDeadline: $applicationDeadline,
        status: $status,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN p.id
    `;

    const params = {
      id: programId,
      title: programData.title || '',
      category: programData.category || 'Mentorship',
      description: programData.description || '',
      image: programData.image || null,
      tags: programData.tags || [],
      organizationId: programData.organizationId || null,
      startDate: programData.startDate || null,
      endDate: programData.endDate || null,
      maxParticipants: programData.maxParticipants || 100,
      currentParticipants: programData.currentParticipants || 0,
      requirements: programData.requirements || [],
      benefits: programData.benefits || [],
      applicationDeadline: programData.applicationDeadline || null,
      status: programData.status || 'active',
      createdAt: now,
      updatedAt: now
    };

    const result = await executeWrite(query, params);
    // Fix: result is unknown[], so cast to object and check for property
    if (result.length > 0 && typeof result[0] === 'object' && result[0] !== null && 'p.id' in result[0]) {
      return (result[0] as { [key: string]: any })['p.id'];
    }
    throw new Error('Failed to create program');
  }

  // Get program by ID
  static async getProgramById(programId: string): Promise<ProgramNode | null> {
    const query = `
      MATCH (p:Program {id: $programId})
      RETURN p
    `;

    const result = await executeRead(query, { programId });
    if (result.length > 0) {
      const program = (result[0] as { [key: string]: any }).p;
      return program && program.properties ? program.properties : program;
    }
    return null;
  }

  // Get all programs
  static async getAllPrograms(category?: string, status?: string): Promise<ProgramNode[]> {
    let query = `MATCH (p:Program)`;
    const conditions = [];
    const params: any = {};

    if (category) {
      conditions.push('p.category = $category');
      params.category = category;
    }
    if (status) {
      conditions.push('p.status = $status');
      params.status = status;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` RETURN p ORDER BY p.createdAt DESC`;

    const result = await executeRead(query, params);
    return result.map((record: unknown) => {
      const program = (record as { [key: string]: any }).p;
      return program && program.properties ? program.properties : program;
    });
  }

  // Enroll user in program
  static async enrollUserInProgram(uid: string, programId: string, enrollmentData?: Partial<ProgramEnrollmentRelationship>): Promise<void> {
    const now = new Date().toISOString();
    
    const query = `
      MATCH (u:User {uid: $uid})
      MATCH (p:Program {id: $programId})
      MERGE (u)-[r:ENROLLED_IN]->(p)
      SET r.enrollmentDate = $enrollmentDate,
          r.status = $status,
          r.progress = $progress,
          r.grade = $grade,
          r.feedback = $feedback,
          r.completionDate = $completionDate
    `;

    const params = {
      uid,
      programId,
      enrollmentDate: now,
      status: 'enrolled',
      progress: 0,
      ...enrollmentData
    };

    await executeWrite(query, params);
  }

  // Get user programs
  static async getUserPrograms(uid: string): Promise<Array<{ program: ProgramNode; relationship: ProgramEnrollmentRelationship }>> {
    const query = `
      MATCH (u:User {uid: $uid})-[r:ENROLLED_IN]->(p:Program)
      RETURN p as program, r as relationship
    `;

    const result = await executeRead(query, { uid });
    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      return {
        program: rec.program && rec.program.properties ? rec.program.properties : rec.program,
        relationship: rec.relationship && rec.relationship.properties ? rec.relationship.properties : rec.relationship
      };
    });
  }
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

export class Neo4jActivityService {
  // Log user activity
  static async logUserActivity(activityData: Omit<ActivityNode, 'id' | 'createdAt'>): Promise<void> {
    const now = new Date().toISOString();
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert metadata object to JSON string for Neo4j compatibility
    const metadataString = activityData.metadata ? JSON.stringify(activityData.metadata) : null;
    
    const query = `
      MATCH (u:User {uid: $uid})
      CREATE (a:Activity {
        id: $id,
        uid: $uid,
        action: $action,
        description: $description,
        metadata: $metadata,
        ipAddress: $ipAddress,
        userAgent: $userAgent,
        createdAt: $createdAt
      })
      CREATE (u)-[:HAS_ACTIVITY]->(a)
    `;

    const params = {
      id: activityId,
      ...activityData,
      metadata: metadataString,
      createdAt: now
    };

    // Ensure all parameters are primitive values for Neo4j compatibility
    const sanitizedParams = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key, 
        value === null ? null : 
        value === undefined ? null : 
        typeof value === 'object' ? JSON.stringify(value) : 
        value
      ])
    );

    console.log('Executing activity log query with params:', sanitizedParams);
    await executeWrite(query, sanitizedParams);
  }

  // Get user activity
  static async getUserActivity(uid: string, limit: number = 10): Promise<ActivityNode[]> {
    const query = `
      MATCH (u:User {uid: $uid})-[:HAS_ACTIVITY]->(a:Activity)
      RETURN a
      ORDER BY a.createdAt DESC
      LIMIT $limit
    `;

    const result = await executeRead(query, { uid, limit: Math.floor(limit) });
    return result.map((record: unknown) => {
      const activity = (record as { [key: string]: any }).a;
      return activity && activity.properties ? activity.properties : activity;
    });
  }
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

export class Neo4jSettingsService {
  // Create or update user settings
  static async upsertUserSettings(uid: string, settings: Partial<SettingsNode>): Promise<void> {
    const now = new Date().toISOString();
    
    const query = `
      MATCH (u:User {uid: $uid})
      MERGE (u)-[:HAS_SETTINGS]->(s:Settings {uid: $uid})
      ON CREATE SET s.uid = $uid
      SET s.theme = $theme,
          s.language = $language,
          s.timezone = $timezone,
          s.emailNotifications = $emailNotifications,
          s.pushNotifications = $pushNotifications,
          s.marketingEmails = $marketingEmails,
          s.weeklyDigest = $weeklyDigest,
          s.mentorshipNotifications = $mentorshipNotifications,
          s.projectUpdates = $projectUpdates,
          s.communityUpdates = $communityUpdates,
          s.updatedAt = $updatedAt
    `;

    const params = {
      uid,
      ...settings,
      updatedAt: now
    };

    await executeWrite(query, params);
  }

  // Get user settings
  static async getUserSettings(uid: string): Promise<SettingsNode | null> {
    const query = `
      MATCH (u:User {uid: $uid})-[:HAS_SETTINGS]->(s:Settings)
      RETURN s
    `;

    const result = await executeRead(query, { uid });
    if (result.length > 0) {
      const settings = (result[0] as { [key: string]: any }).s;
      return settings && settings.properties ? settings.properties : settings;
    }
    return null;
  }
}

// ============================================================================
// MEDIA MANAGEMENT
// ============================================================================

export class Neo4jMediaService {
  // Create media item
  static async createMediaItem(mediaData: Partial<MediaNode>): Promise<string> {
    const now = new Date().toISOString();
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      CREATE (m:Media {
        id: $id,
        prompt: $prompt,
        imageUrl: $imageUrl,
        provider: $provider,
        promptKey: $promptKey,
        imageSizeBytes: $imageSizeBytes,
        mimeType: $mimeType,
        generatedBy: $generatedBy,
        createdAt: $createdAt
      })
      ${mediaData.generatedBy ? 'MATCH (u:User {uid: $generatedBy}) CREATE (u)-[:GENERATED_BY]->(m)' : ''}
      RETURN m.id
    `;

    const params = {
      id: mediaId,
      ...mediaData,
      createdAt: now
    };

    const result = await executeWrite(query, params);
    if (result.length > 0 && typeof result[0] === 'object' && result[0] !== null && 'm.id' in result[0]) {
      return (result[0] as { [key: string]: any })['m.id'];
    }
    throw new Error('Failed to create media item');
  }

  // Get media by prompt key
  static async getMediaByPromptKey(promptKey: string): Promise<MediaNode | null> {
    const query = `
      MATCH (m:Media {promptKey: $promptKey})
      RETURN m
    `;

    const result = await executeRead(query, { promptKey });
    if (result.length > 0) {
      const media = (result[0] as { [key: string]: any }).m;
      return media && media.properties ? media.properties : media;
    }
    return null;
  }

  // Get user media
  static async getUserMedia(uid: string): Promise<MediaNode[]> {
    const query = `
      MATCH (u:User {uid: $uid})-[:GENERATED_BY]->(m:Media)
      RETURN m
      ORDER BY m.createdAt DESC
    `;

    const result = await executeRead(query, { uid });
    return result.map((record: unknown) => {
      const media = (record as { [key: string]: any }).m;
      return media && media.properties ? media.properties : media;
    });
  }
}

// ============================================================================
// ORGANIZATION MANAGEMENT
// ============================================================================

export class Neo4jOrganizationService {
  // Create organization
  static async createOrganization(orgData: Partial<OrganizationNode>): Promise<string> {
    const now = new Date().toISOString();
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      CREATE (o:Organization {
        id: $id,
        name: $name,
        type: $type,
        description: $description,
        website: $website,
        logo: $logo,
        location: $location,
        industry: $industry,
        size: $size,
        founded: $founded,
        mission: $mission,
        programs: $programs,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN o.id
    `;

    const params = {
      id: orgId,
      ...orgData,
      createdAt: now,
      updatedAt: now
    };

    const result = await executeWrite(query, params);
    if (result.length > 0 && typeof result[0] === 'object' && result[0] !== null && 'o.id' in result[0]) {
      return (result[0] as { [key: string]: any })['o.id'];
    }
    throw new Error('Failed to create organization');
  }

  // Get organization by ID
  static async getOrganizationById(orgId: string): Promise<OrganizationNode | null> {
    const query = `
      MATCH (o:Organization {id: $orgId})
      RETURN o
    `;

    const result = await executeRead(query, { orgId });
    if (result.length > 0) {
      const org = (result[0] as { [key: string]: any }).o;
      return org && org.properties ? org.properties : org;
    }
    return null;
  }

  // Get all organizations
  static async getAllOrganizations(type?: string): Promise<OrganizationNode[]> {
    let query = `MATCH (o:Organization)`;
    const params: any = {};

    if (type) {
      query += ` WHERE o.type = $type`;
      params.type = type;
    }

    query += ` RETURN o ORDER BY o.name`;

    const result = await executeRead(query, params);
    return result.map((record: unknown) => {
      const org = (record as { [key: string]: any }).o;
      return org && org.properties ? org.properties : org;
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export class Neo4jUtilityService {
  // Clear all data (for testing/development)
  static async clearAllData(): Promise<void> {
    const query = `MATCH (n) DETACH DELETE n`;
    await executeWrite(query, {});
  }

  // Get database statistics
  static async getDatabaseStats(): Promise<any> {
    const query = `
      MATCH (n)
      RETURN labels(n) as labels, count(n) as count
      ORDER BY count DESC
    `;

    const result = await executeRead(query, {});
    return result;
  }

  // Create indexes for better performance
  static async createIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX user_uid IF NOT EXISTS FOR (u:User) ON (u.uid)',
      'CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email)',
      'CREATE INDEX user_type IF NOT EXISTS FOR (u:User) ON (u.type)',
      'CREATE INDEX program_id IF NOT EXISTS FOR (p:Program) ON (p.id)',
      'CREATE INDEX skill_name IF NOT EXISTS FOR (s:Skill) ON (s.name)',
      'CREATE INDEX interest_name IF NOT EXISTS FOR (i:Interest) ON (i.name)',
      'CREATE INDEX activity_uid IF NOT EXISTS FOR (a:Activity) ON (a.uid)',
      'CREATE INDEX media_prompt_key IF NOT EXISTS FOR (m:Media) ON (m.promptKey)'
    ];

    for (const indexQuery of indexes) {
      try {
        await executeWrite(indexQuery, {});
      } catch (error) {
        console.warn(`Index creation warning: ${error}`);
      }
    }
  }
}
