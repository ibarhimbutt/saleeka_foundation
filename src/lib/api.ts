// Centralized API service layer
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' ? '' : '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // User Profile APIs
  async getUserProfile(uid: string) {
    return this.request<{ success: boolean; user?: any }>(
      `/api/auth/profile?uid=${encodeURIComponent(uid)}`
    );
  }

  async updateUserProfile(uid: string, updates: any) {
    return this.request<{ success: boolean; message?: string }>(
      '/api/user/profile',
      {
        method: 'PUT',
        body: JSON.stringify({ uid, updates }),
      }
    );
  }

  async getUserSettings(uid: string) {
    return this.request<{ success: boolean; settings?: any }>(
      `/api/user/settings?uid=${encodeURIComponent(uid)}`
    );
  }

  async updateUserSettings(uid: string, settings: any) {
    return this.request<{ success: boolean; message?: string }>(
      '/api/user/settings',
      {
        method: 'PUT',
        body: JSON.stringify({ uid, settings }),
      }
    );
  }

  async getUserInterests(uid: string) {
    return this.request<{ success: boolean; interests?: any[] }>(
      `/api/user/interests?uid=${encodeURIComponent(uid)}`
    );
  }

  async updateUserInterests(uid: string, interests: any[]) {
    return this.request<{ success: boolean; message?: string }>(
      '/api/user/interests',
      {
        method: 'POST',
        body: JSON.stringify({ uid, interests }),
      }
    );
  }

  async logUserActivity(uid: string, action: string, description: string) {
    return this.request<{ success: boolean; message?: string }>(
      '/api/user/activity',
      {
        method: 'POST',
        body: JSON.stringify({ uid, action, description }),
      }
    );
  }

  async getUserActivities(uid: string, limit: number = 20) {
    return this.request<{ success: boolean; activities?: any[] }>(
      `/api/user/activity?uid=${encodeURIComponent(uid)}&limit=${limit}`
    );
  }

  // Interests APIs
  async getAvailableInterests() {
    return this.request<{ interests: any[] }>('/api/interests');
  }

  // Auth APIs
  async createUserProfile(userData: any) {
    return this.request<{ success: boolean; message?: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
  }

  // AI/Image APIs
  async generateImage(prompt: string) {
    return this.request<{ imageUrl?: string; error?: string; fallbackImageUrl?: string }>(
      '/api/generate-image',
      {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }
    );
  }

  async generateProfile(content: string) {
    return this.request<{ summary?: string; error?: string }>(
      '/api/generate-profile',
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
  }

  async getAiRecommendations(userId: string) {
    return this.request<{ recommendations: any[] }>(
      `/api/ai-recommendations?userId=${encodeURIComponent(userId)}`
    );
  }

  // Neo4j APIs
  async initializeNeo4j(action: string) {
    return this.request<{ success: boolean; message?: string }>(
      '/api/neo4j-init',
      {
        method: 'POST',
        body: JSON.stringify({ action }),
      }
    );
  }

  async cleanupNeo4j() {
    return this.request<{ success: boolean; message?: string }>(
      '/api/neo4j-cleanup',
      {
        method: 'POST',
      }
    );
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Type definitions for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserProfileResponse extends ApiResponse {
  user?: any;
}

export interface UserSettingsResponse extends ApiResponse {
  settings?: any;
}

export interface UserInterestsResponse extends ApiResponse {
  interests?: any[];
}

export interface UserActivitiesResponse extends ApiResponse {
  activities?: any[];
}

export interface InterestsResponse extends ApiResponse {
  interests: any[];
}

export interface ImageGenerationResponse extends ApiResponse {
  imageUrl?: string;
  fallbackImageUrl?: string;
}

export interface ProfileGenerationResponse extends ApiResponse {
  summary?: string;
}

export interface AiRecommendationsResponse extends ApiResponse {
  recommendations: any[];
}
