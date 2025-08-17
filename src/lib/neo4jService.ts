import { 
  executeRead, 
  executeWrite, 
  executeTransaction,
  getSession 
} from './neo4j';
import {
  StudentNode, 
  MentorNode, 
  AdminNode, 
  DonorNode,
  OrganizationNode,
  ProgramNode,
  ProjectNode,
  SkillNode,
  InterestNode,
  ActivityNode,
  SettingsNode,
  MediaNode,
  MentorshipRelationship,
  SkillRelationship,
  ProgramEnrollmentRelationship,
  UserWithRelationships,
  MentorshipMatch,
  Neo4jResult,
  Neo4jRecord,
  NODE_LABELS,
  RELATIONSHIP_TYPES
} from './neo4jTypes';

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export class Neo4jUserService {
  // Create a new user node
  static async createUser(userData: Partial<StudentNode | MentorNode | AdminNode | DonorNode>): Promise<void> {
    const now = new Date().toISOString();
    const userType = userData.type || 'student';
    
    // Create base User node first
    const baseUserQuery = `
      CREATE (u:User {
        uid: $uid,
        email: $email,
        password: $password,
        displayName: $displayName,
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

    const baseUserParams = {
      uid: userData.uid || '',
      email: userData.email || '',
      password: userData.password || null,
      displayName: userData.displayName || '',
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

    // Execute the base user creation
    console.log('Creating base User node with params:', baseUserParams);
    await executeWrite(baseUserQuery, baseUserParams);

    // Create role-specific node and establish relationship
    if (userType === 'mentor') {
      const mentorData = userData as Partial<MentorNode>;
      const mentorQuery = `
        MATCH (u:User {uid: $uid})
        CREATE (m:Mentor {
          uid: $uid,
          expertise: $expertise,
          category: $category,
          yearsOfExperience: $yearsOfExperience,
          industry: $industry,
          certifications: $certifications,
          availability: $availability,
          maxMentees: $maxMentees,
          currentMentees: $currentMentees,
          rating: $rating,
          totalMentees: $totalMentees,
          specialties: $specialties,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        CREATE (u)-[:HAS_PROFILE]->(m)
      `;

      const mentorParams = {
        uid: userData.uid,
        expertise: mentorData.expertise || [],
        category: mentorData.category || 'General',
        yearsOfExperience: mentorData.yearsOfExperience || 0,
        industry: mentorData.industry || null,
        certifications: mentorData.certifications || [],
        availability: mentorData.availability || null,
        maxMentees: mentorData.maxMentees || 3,
        currentMentees: mentorData.currentMentees || 0,
        rating: mentorData.rating || 0,
        totalMentees: mentorData.totalMentees || 0,
        specialties: mentorData.specialties || [],
        createdAt: now,
        updatedAt: now
      };

      console.log('Creating Mentor node with params:', mentorParams);
      await executeWrite(mentorQuery, mentorParams);
    } else if (userType === 'student') {
      const studentData = userData as Partial<StudentNode>;
      const studentQuery = `
        MATCH (u:User {uid: $uid})
        CREATE (s:Student {
          uid: $uid,
          interests: $interests,
          skills: $skills,
          currentProgram: $currentProgram,
          graduationYear: $graduationYear,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        CREATE (u)-[:HAS_PROFILE]->(s)
      `;

      const studentParams = {
        uid: userData.uid,
        interests: studentData.interests || [],
        skills: studentData.skills || [],
        currentProgram: studentData.currentProgram || null,
        graduationYear: studentData.graduationYear || null,
        createdAt: now,
        updatedAt: now
      };

      console.log('Creating Student node with params:', studentParams);
      await executeWrite(studentQuery, studentParams);
    } else if (userType === 'admin') {
      const adminQuery = `
        MATCH (u:User {uid: $uid})
        CREATE (a:Admin {
          uid: $uid,
          permissions: $permissions,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        CREATE (u)-[:HAS_PROFILE]->(a)
      `;

      const adminParams = {
        uid: userData.uid,
        permissions: ['read', 'write', 'delete'],
        createdAt: now,
        updatedAt: now
      };

      console.log('Creating Admin node with params:', adminParams);
      await executeWrite(adminQuery, adminParams);
    } else if (userType === 'donor') {
      const donorData = userData as Partial<DonorNode>;
      const donorQuery = `
        MATCH (u:User {uid: $uid})
        CREATE (d:Donor {
          uid: $uid,
          donationHistory: $donationHistory,
          preferredPrograms: $preferredPrograms,
          totalDonated: $totalDonated,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        CREATE (u)-[:HAS_PROFILE]->(d)
      `;

      const donorParams = {
        uid: userData.uid,
        donationHistory: donorData.donationHistory || [],
        preferredPrograms: donorData.preferredPrograms || [],
        totalDonated: donorData.totalDonated || 0,
        createdAt: now,
        updatedAt: now
      };

      console.log('Creating Donor node with params:', donorParams);
      await executeWrite(donorQuery, donorParams);
    }
  }

  // Get user by UID
  static async getUserByUid(uid: string): Promise<StudentNode | MentorNode | AdminNode | DonorNode | null> {
    const query = `
      MATCH (u:User {uid: $uid})
      OPTIONAL MATCH (u)-[:HAS_PROFILE]->(profile)
      RETURN u, profile
    `;

    const result = await executeRead(query, { uid });
    
    if (result.length > 0) {
      const record = result[0] as { [key: string]: any };
      const userNode = record.u;
      const profileNode = record.profile;
      
      if (userNode && userNode.properties) {
        const userProperties = userNode.properties;
        
        // If there's a profile node, merge its properties
        if (profileNode && profileNode.properties) {
          const profileProperties = profileNode.properties;
          return { ...userProperties, ...profileProperties };
        }
        
        return userProperties;
      }
    }
    
    return null;
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<StudentNode | MentorNode | AdminNode | DonorNode | null> {
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
  static async updateUserProfile(uid: string, updates: Partial<StudentNode | MentorNode | AdminNode | DonorNode>): Promise<void> {
    const now = new Date().toISOString();
    
    // Handle name updates - combine firstName and lastName into displayName
    let processedUpdates = { ...updates };
    if (updates.firstName || updates.lastName) {
      const currentUser = await this.getUserByUid(uid);
      const currentFirstName = currentUser?.firstName || '';
      const currentLastName = currentUser?.lastName || '';
      
      const newFirstName = updates.firstName || currentFirstName;
      const newLastName = updates.lastName || currentLastName;
      
      // Combine into displayName
      processedUpdates.displayName = `${newFirstName} ${newLastName}`.trim();
      
      // Remove firstName and lastName from updates to avoid creating new properties
      delete processedUpdates.firstName;
      delete processedUpdates.lastName;
    }
    
    const setClause = Object.keys(processedUpdates)
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

    await executeWrite(query, { uid, ...processedUpdates, updatedAt: now });
  }

  // Delete user
  static async deleteUser(uid: string): Promise<void> {
    // First, get the user type and handle mentor-mentee relationships
    const getUserQuery = `
      MATCH (u:User {uid: $uid})
      RETURN u.type as userType, u.uid as uid
    `;
    
    const userResult = await executeRead(getUserQuery, { uid });
    
    if (userResult.length === 0) {
      console.log(`User with UID ${uid} not found`);
      return;
    }
    
    const userRecord = userResult[0] as { userType: string; uid: string };
    const userType = userRecord.userType;
    
    if (userType === 'student') {
      // If it's a student, decrease mentee count for all mentors
      const decreaseMenteeCountQuery = `
        MATCH (s:User {uid: $uid, type: 'student'})-[r:IS_MENTORED_BY]->(m:User {type: 'mentor'})
        WHERE r.status IN ['pending', 'active']
        WITH m, count(r) as activeRelationships
        MATCH (m)-[:HAS_PROFILE]->(mp:Mentor)
        SET mp.currentMentees = CASE 
          WHEN mp.currentMentees IS NULL OR mp.currentMentees < $decreaseCount 
          THEN 0 
          ELSE mp.currentMentees - $decreaseCount 
        END,
        mp.updatedAt = $updatedAt
        RETURN m.uid as mentorUid, mp.currentMentees as newCount
      `;
      
      try {
        await executeWrite(decreaseMenteeCountQuery, { 
          uid, 
          decreaseCount: 1, 
          updatedAt: new Date().toISOString() 
        });
        console.log(`Decreased mentee count for mentors of student ${uid}`);
      } catch (error) {
        console.error(`Error decreasing mentee count for student ${uid}:`, error);
      }
    } else if (userType === 'mentor') {
      // If it's a mentor, decrease mentor count for all students
      const decreaseMentorCountQuery = `
        MATCH (m:User {uid: $uid, type: 'mentor'})-[r:MENTORS]->(s:User {type: 'student'})
        WHERE r.status IN ['pending', 'active']
        WITH s, count(r) as activeRelationships
        MATCH (s)-[:HAS_PROFILE]->(sp:Student)
        SET sp.currentMentors = CASE 
          WHEN sp.currentMentors IS NULL OR sp.currentMentors < $decreaseCount 
          THEN 0 
          ELSE sp.currentMentors - $decreaseCount 
        END,
        sp.updatedAt = $updatedAt
        RETURN s.uid as studentUid, sp.currentMentors as newCount
      `;
      
      try {
        await executeWrite(decreaseMentorCountQuery, { 
          uid, 
          decreaseCount: 1, 
          updatedAt: new Date().toISOString() 
        });
        console.log(`Decreased mentor count for students of mentor ${uid}`);
      } catch (error) {
        console.error(`Error decreasing mentor count for mentor ${uid}:`, error);
      }
    }
    
    // Now delete the user and all their relationships, including role-specific nodes
    const deleteQuery = `
      MATCH (u:User {uid: $uid})
      OPTIONAL MATCH (u)-[:HAS_PROFILE]->(profile)
      OPTIONAL MATCH (u)-[:HAS_SETTINGS]->(settings)
      OPTIONAL MATCH (u)-[:HAS_SKILL]->(skill)
      OPTIONAL MATCH (u)-[:INTERESTED_IN]->(interest)
      OPTIONAL MATCH (u)-[:ENROLLED_IN]->(program)
      OPTIONAL MATCH (u)-[:HAS_ACTIVITY]->(activity)
      OPTIONAL MATCH (u)-[:IS_MENTORED_BY]->(mentor)
      OPTIONAL MATCH (u)-[:MENTORS]->(student)
      OPTIONAL MATCH (u)-[:HAS_MEDIA]->(media)
      OPTIONAL MATCH (u)-[:GENERATED_BY]->(generatedMedia)
      
      // Delete all relationships and nodes
      DETACH DELETE u, profile, settings, skill, interest, program, activity, mentor, student, media, generatedMedia
    `;

    await executeWrite(deleteQuery, { uid });
    console.log(`User ${uid}, role-specific nodes, and all relationships deleted successfully`);
  }

  // Get all users by type
  static async getUsersByType(type: string): Promise<Array<StudentNode | MentorNode | AdminNode | DonorNode>> {
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
  static async searchUsers(searchTerm: string, userType?: string): Promise<Array<StudentNode | MentorNode | AdminNode | DonorNode>> {
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

  // Update mentor's mentee count
  static async updateMentorMenteeCount(mentorUid: string, increment: number): Promise<void> {
    const query = `
      MATCH (m:Mentor {uid: $mentorUid})
      SET m.currentMentees = COALESCE(m.currentMentees, 0) + $increment,
          m.totalMentees = COALESCE(m.totalMentees, 0) + $increment,
          m.updatedAt = $updatedAt
    `;

    const params = {
      mentorUid,
      increment,
      updatedAt: new Date().toISOString()
    };

    await executeWrite(query, params);
  }

  // Update student's mentor count
  static async updateStudentMentorCount(studentUid: string, increment: number): Promise<void> {
    const query = `
      MATCH (s:Student {uid: $studentUid})
      SET s.currentMentors = COALESCE(s.currentMentors, 0) + $increment,
          s.totalMentors = COALESCE(s.totalMentors, 0) + $increment,
          s.updatedAt = $updatedAt
    `;

    const params = {
      studentUid,
      increment,
      updatedAt: new Date().toISOString()
    };

    await executeWrite(query, params);
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
      MATCH (s:User {uid: $studentUid, type: 'student'})
      MATCH (m:User {uid: $mentorUid, type: 'mentor'})
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
    
    console.log(`Mentorship relationship created with status: ${relationshipData.status || 'pending'}`);
    console.log(`Student UID: ${studentUid}, Mentor UID: ${mentorUid}`);
    
    // Only update counts if the mentorship is active (not pending)
    // For pending requests, counts will be updated when the mentor accepts
    if (relationshipData.status === 'active') {
      try {
        // Update mentor's current mentee count
        await Neo4jUserService.updateMentorMenteeCount(mentorUid, 1);
        
        // Update student's current mentor count
        await Neo4jUserService.updateStudentMentorCount(studentUid, 1);
        
        console.log(`Active mentorship relationship created and counts updated for student ${studentUid} and mentor ${mentorUid}`);
      } catch (error) {
        console.error('Error updating mentor/student counts:', error);
        // Don't throw error here as the relationship was created successfully
      }
    } else {
      console.log(`Pending mentorship relationship created for student ${studentUid} and mentor ${mentorUid} - counts will be updated when accepted`);
    }
  }

  // Get mentorship matches for a student
  static async getMentorshipMatches(studentUid: string, limit: number = 10): Promise<MentorshipMatch[]> {
    // Ensure limit is an integer
    const limitInt = Math.floor(limit);
    const query = `
      MATCH (s:User {uid: $studentUid, type: 'student'})
      MATCH (m:User {type: 'mentor'})
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
    // First, get the current status to determine if we need to update counts
    const getCurrentStatusQuery = `
      MATCH (s:User {uid: $studentUid, type: 'student'})-[r:IS_MENTORED_BY]->(m:User {uid: $mentorUid, type: 'mentor'})
      RETURN r.status as currentStatus
    `;
    
    const currentStatusResult = await executeRead(getCurrentStatusQuery, { studentUid, mentorUid });
    const currentStatusRecord = currentStatusResult.length > 0 ? currentStatusResult[0] as { currentStatus: string } : null;
    const currentStatus = currentStatusRecord ? currentStatusRecord.currentStatus : null;
    
    let setUpdates = '';
    if (updates && Object.keys(updates).length > 0) {
      setUpdates = Object.keys(updates)
        .map(key => `, r.${key} = $${key}, r2.${key} = $${key}`)
        .join('');
    }
    
    const query = `
      MATCH (s:User {uid: $studentUid, type: 'student'})-[r:IS_MENTORED_BY]->(m:User {uid: $mentorUid, type: 'mentor'})
      MATCH (m)-[r2:MENTORS]->(s)
      SET r.status = $status, r2.status = $status${setUpdates}
    `;

    await executeWrite(query, { studentUid, mentorUid, status, ...(updates || {}) });
    
    // Update counts based on status changes
    try {
      if (currentStatus === 'pending' && status === 'active') {
        // Relationship activated - increment counts since they weren't set during pending creation
        await Neo4jUserService.updateMentorMenteeCount(mentorUid, 1);
        await Neo4jUserService.updateStudentMentorCount(studentUid, 1);
        console.log(`Mentorship activated for student ${studentUid} and mentor ${mentorUid} - counts incremented`);
      } else if (currentStatus === 'active' && (status === 'completed' || status === 'terminated')) {
        // Relationship ended - decrease counts
        await Neo4jUserService.updateMentorMenteeCount(mentorUid, -1);
        await Neo4jUserService.updateStudentMentorCount(studentUid, -1);
        console.log(`Mentorship ended, counts decreased for student ${studentUid} and mentor ${mentorUid}`);
      } else if (currentStatus === 'pending' && (status === 'completed' || status === 'terminated')) {
        // Pending relationship rejected/terminated - decrease counts
        await Neo4jUserService.updateMentorMenteeCount(mentorUid, -1);
        await Neo4jUserService.updateStudentMentorCount(studentUid, -1);
        console.log(`Pending mentorship rejected, counts decreased for student ${studentUid} and mentor ${mentorUid}`);
      } else if (currentStatus === 'active' && status === 'rejected') {
        // Active relationship rejected - decrease counts
        await Neo4jUserService.updateMentorMenteeCount(mentorUid, -1);
        await Neo4jUserService.updateStudentMentorCount(studentUid, -1);
        console.log(`Active mentorship rejected, counts decreased for student ${studentUid} and mentor ${mentorUid}`);
      }
    } catch (error) {
      console.error('Error updating counts during status change:', error);
      // Don't throw error here as the status was updated successfully
    }
  }

  // Get pending mentorship requests for a mentor
  static async getPendingMentorshipRequests(mentorUid: string): Promise<any[]> {
    console.log(`Fetching pending mentorship requests for mentor: ${mentorUid}`);
    
    const query = `
      MATCH (m:User {uid: $mentorUid, type: 'mentor'})-[r:MENTORS]->(s:User {type: 'student'})
      WHERE r.status = 'pending'
      RETURN s as student, s as studentProfile, s as user, r as relationship
      ORDER BY r.startDate DESC
    `;

    console.log('Query:', query);
    console.log('Parameters:', { mentorUid });

    const result = await executeRead(query, { mentorUid });
    console.log(`Found ${result.length} pending requests for mentor ${mentorUid}`);
    
    if (result.length > 0) {
      console.log('First result:', JSON.stringify(result[0], null, 2));
    }

    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      return {
        student: rec.student && rec.student.properties ? rec.student.properties : rec.student,
        studentProfile: rec.studentProfile && rec.studentProfile.properties ? rec.studentProfile.properties : rec.studentProfile,
        user: rec.user && rec.user.properties ? rec.user.properties : rec.user,
        relationship: rec.relationship && rec.relationship.properties ? rec.relationship.properties : rec.relationship
      };
    });
  }

  // Get pending mentorship requests for a student
  static async getPendingMentorshipRequestsForStudent(studentUid: string): Promise<any[]> {
    const query = `
      MATCH (s:User {uid: $studentUid, type: 'student'})-[r:IS_MENTORED_BY]->(m:User {type: 'mentor'})
      WHERE r.status = 'pending'
      RETURN m as mentor, m as mentorProfile, m as user, r as relationship
      ORDER BY r.startDate DESC
    `;

    const result = await executeRead(query, { studentUid });
    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      return {
        mentor: rec.mentor && rec.mentor.properties ? rec.mentor.properties : rec.mentor,
        mentorProfile: rec.mentorProfile && rec.mentorProfile.properties ? rec.mentorProfile.properties : rec.mentorProfile,
        user: rec.user && rec.user.properties ? rec.user.properties : rec.user,
        relationship: rec.relationship && rec.relationship.properties ? rec.relationship.properties : rec.relationship
      };
    });
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
    // Ensure limit is a valid integer
    const intLimit = Math.floor(Number(limit)) || 10;
    
    // Build query with limit as a literal to avoid type conversion issues
    const query = `
      MATCH (u:User {uid: $uid})-[:HAS_ACTIVITY]->(a:Activity)
      RETURN a
      ORDER BY a.createdAt DESC
      LIMIT ${intLimit}
    `;

    const result = await executeRead(query, { uid });
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
// PROJECT MANAGEMENT
// ============================================================================

export class Neo4jProjectService {
  // Create project
  static async createProject(projectData: Partial<ProjectNode>): Promise<string> {
    const now = new Date().toISOString();
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      CREATE (p:Project {
        id: $id,
        title: $title,
        description: $description,
        category: $category,
        skills: $skills,
        location: $location,
        duration: $duration,
        teamSize: $teamSize,
        status: $status,
        postedDate: $postedDate,
        deadline: $deadline,
        compensation: $compensation,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN p.id
    `;

    const params = {
      id: projectId,
      ...projectData,
      createdAt: now,
      updatedAt: now
    };

    const result = await executeWrite(query, params);
    if (result.length > 0 && typeof result[0] === 'object' && result[0] !== null && 'p.id' in result[0]) {
      return (result[0] as { [key: string]: any })['p.id'];
    }
    throw new Error('Failed to create project');
  }

  // Get project by ID
  static async getProjectById(projectId: string): Promise<ProjectNode | null> {
    const query = `
      MATCH (p:Project {id: $projectId})
      RETURN p
    `;

    const result = await executeRead(query, { projectId });
    if (result.length > 0) {
      const project = (result[0] as { [key: string]: any }).p;
      return project && project.properties ? project.properties : project;
    }
    return null;
  }

  // Get all projects with organization details
  static async getAllProjects(): Promise<any[]> {
    const query = `
      MATCH (p:Project)
      OPTIONAL MATCH (o:Organization)-[:POSTED]->(p)
      RETURN p as project, o as organization
      ORDER BY p.postedDate DESC
    `;

    const result = await executeRead(query, {});
    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      const project = rec.project && rec.project.properties ? rec.project.properties : rec.project;
      const organization = rec.organization && rec.organization.properties ? rec.organization.properties : rec.organization;
      
      return {
        ...project,
        organization: organization || {
          id: 'unknown',
          name: 'Unknown Organization',
          industry: 'Unknown'
        }
      };
    });
  }

  // Get projects by organization
  static async getProjectsByOrganization(orgId: string): Promise<ProjectNode[]> {
    const query = `
      MATCH (o:Organization {id: $orgId})-[:POSTED]->(p:Project)
      RETURN p
      ORDER BY p.postedDate DESC
    `;

    const result = await executeRead(query, { orgId });
    return result.map((record: unknown) => {
      const project = (record as { [key: string]: any }).p;
      return project && project.properties ? project.properties : project;
    });
  }
}

// ============================================================================
// MENTOR MANAGEMENT
// ============================================================================

export class Neo4jMentorService {
  // Get all mentors
  static async getAllMentors(limit: number = 12, category?: string): Promise<any[]> {
    let query = `
      MATCH (u:User {type: 'mentor'})
      OPTIONAL MATCH (u)-[:HAS_PROFILE]->(m:Mentor)
      WHERE u.isActive = true
    `;
    const params: any = {};

    if (category) {
      // Strict filtering: only return mentors that have the specific category in their expertise
      // and ensure the expertise field is not null or empty
      query += ` AND (
        (m.category IS NOT NULL AND $category IN m.category) OR 
        (u.expertise IS NOT NULL AND u.expertise <> [] AND $category IN u.expertise)
      )`;
      params.category = category;
    }

    query += `
      OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
      RETURN u as user, m as mentor, collect(DISTINCT s.name) as skills
      ORDER BY COALESCE(m.rating, u.rating, 0) DESC, COALESCE(m.yearsOfExperience, u.yearsOfExperience, 0) DESC
      LIMIT ${limit}
    `;

    const result = await executeRead(query, params);
    return result.map((record: unknown) => {
      const rec = record as { [key: string]: any };
      const user = rec.user && rec.user.properties ? rec.user.properties : rec.user;
      const mentor = rec.mentor && rec.mentor.properties ? rec.mentor.properties : rec.mentor;
      const skills = rec.skills || [];
      
      // Merge user and mentor properties, with mentor properties taking precedence
      const mergedMentor = {
        ...user,
        ...mentor,
        skills
      };
      
      return mergedMentor;
    });
  }

  // Get mentor by ID
  static async getMentorById(mentorId: string): Promise<any | null> {
    const query = `
      MATCH (u:User {uid: $mentorId, type: 'mentor'})
      OPTIONAL MATCH (u)-[:HAS_PROFILE]->(m:Mentor)
      OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (u)-[:INTERESTED_IN]->(i:Interest)
      RETURN u as user, m as mentor, 
             collect(DISTINCT s.name) as skills,
             collect(DISTINCT i.name) as interests
    `;

    const result = await executeRead(query, { mentorId });
    if (result.length > 0) {
      const rec = result[0] as { [key: string]: any };
      const user = rec.user && rec.user.properties ? rec.user.properties : rec.user;
      const mentor = rec.mentor && rec.mentor.properties ? rec.mentor.properties : rec.mentor;
      const skills = rec.skills || [];
      const interests = rec.interests || [];
      
      // Merge user and mentor properties, with mentor properties taking precedence
      const mergedMentor = {
        ...user,
        ...mentor,
        skills,
        interests
      };
      
      return mergedMentor;
    }
    return null;
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
