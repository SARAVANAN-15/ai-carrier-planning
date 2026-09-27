// Typed API Client for Career Solver

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('cs_token');
}

export function setToken(token: string) {
  localStorage.setItem('cs_token', token);
}

export function removeToken() {
  localStorage.removeItem('cs_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  demoLogin: (persona: 'arun' | 'muthu' | 'priya' | 'sneha' | 'kavita' | 'deepak' | 'admin') => request<any>(`/auth/demo-login/${persona}`, { method: 'POST' }),
  getCurrentUser: () => request<any>('/auth/me'),

  // Profile & Onboarding
  getProfile: () => request<any>('/profile'),
  updateProfile: (body: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(body) }),
  completeOnboarding: (body: any) => request<any>('/profile/onboarding', { method: 'POST', body: JSON.stringify(body) }),

  // Goals
  getGoals: () => request<any>('/goals'),
  createGoal: (body: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(body) }),

  // Career Discovery, Catalog & Comparison (P0 Engine)
  getCareers: (params?: { category?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return request<{ count: number; careers: any[] }>(`/careers${qs ? `?${qs}` : ''}`);
  },
  getCareerById: (id: string) => request<{ career: any }>(`/careers/${encodeURIComponent(id)}`),
  runDiscovery: (body?: { priorities?: any; overrides?: any }) =>
    request<any>('/discovery', { method: 'POST', body: JSON.stringify(body || {}) }),
  compareCareersList: (careers: string[]) =>
    request<any>('/compare', { method: 'POST', body: JSON.stringify({ careers }) }),
  selectCareerPathway: (body: { careerName: string; targetPathway?: string; currentLevel?: string }) =>
    request<any>('/select-career', { method: 'POST', body: JSON.stringify(body) }),

  // Reality Check & Comparison
  runRealityCheck: (targetCareer: string) => request<any>('/reality-check', { method: 'POST', body: JSON.stringify({ targetCareer }) }),
  getRealityCheckHistory: () => request<any>('/reality-check/history'),
  comparePathways: (careers: string[]) => request<any>('/reality-check/compare', { method: 'POST', body: JSON.stringify({ careers }) }),

  // Navigator
  chatNavigator: (query: string, history: any[] = [], language: string = 'English') =>
    request<any>('/navigator/chat', { method: 'POST', body: JSON.stringify({ query, history, language }) }),

  // Roadmaps & Plans
  getActiveRoadmap: () => request<any>('/roadmaps/active'),
  generateRoadmap: (body: { goalTitle: string; targetPathway?: string; currentLevel?: string }) =>
    request<any>('/roadmaps/generate', { method: 'POST', body: JSON.stringify(body) }),

  // Learn-by-Doing Tasks
  getTasks: (status?: string) => request<any>(`/tasks${status ? `?status=${status}` : ''}`),
  getTodayTasks: () => request<any>('/tasks/today'),
  updateTaskStatus: (id: string, status: string, user_notes?: string) =>
    request<any>(`/tasks/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, user_notes }) }),
  submitTaskNotes: (id: string, userNotes: string) =>
    request<any>(`/tasks/${id}/submit`, { method: 'POST', body: JSON.stringify({ userNotes }) }),

  // AI Mentor
  getMentorMessages: (mode: string) => request<any>(`/mentor/conversations/${mode}`),
  sendMentorMessage: (mode: string, message: string) =>
    request<any>('/mentor/chat', { method: 'POST', body: JSON.stringify({ mode, message }) }),

  // Practice Studio
  getPracticePrompts: () => request<any>('/practice/prompts'),
  evaluatePractice: (body: { practiceType: string; mode: string; promptQuestion: string; userResponse: string }) =>
    request<any>('/practice/evaluate', { method: 'POST', body: JSON.stringify(body) }),
  getPracticeHistory: () => request<any>('/practice/history'),

  // Challenges
  getChallenges: () => request<any>('/challenges'),
  joinChallenge: (id: string) => request<any>(`/challenges/${id}/join`, { method: 'POST' }),
  checkChallengeDay: (id: string, dayNumber: number) =>
    request<any>(`/challenges/${id}/check-day`, { method: 'POST', body: JSON.stringify({ dayNumber }) }),

  // Community
  getPosts: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request<any>(`/community/posts?${params.toString()}`);
  },
  createPost: (body: { title?: string; content: string; category?: string }) =>
    request<any>('/community/posts', { method: 'POST', body: JSON.stringify(body) }),
  deletePost: (id: string) => request<any>(`/community/posts/${id}`, { method: 'DELETE' }),
  likePost: (id: string) => request<any>(`/community/posts/${id}/like`, { method: 'POST' }),
  getComments: (postId: string) => request<any>(`/community/posts/${postId}/comments`),
  addComment: (postId: string, content: string) =>
    request<any>(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  reportPost: (postId: string, reason: string) =>
    request<any>(`/community/posts/${postId}/report`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Mentors (Human Mentorship Hub)
  getMentors: (area?: string, search?: string) => {
    const params = new URLSearchParams();
    if (area) params.append('area', area);
    if (search) params.append('search', search);
    return request<any>(`/mentors?${params.toString()}`);
  },
  requestMentorship: (mentorId: string, body: { message: string; goals?: string; preferredTime?: string }) =>
    request<any>(`/mentors/${mentorId}/request`, { method: 'POST', body: JSON.stringify(body) }),
  getMyMentorRequests: () => request<any>('/mentors/my-requests'),

  // Organizations & Opportunities
  getOrganizations: (type?: string) => request<any>(`/organizations${type ? `?type=${type}` : ''}`),
  getOpportunities: (type?: string, search?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    return request<any>(`/opportunities?${params.toString()}`);
  },
  applyOpportunity: (oppId: string, notes?: string) =>
    request<any>(`/opportunities/${oppId}/apply`, { method: 'POST', body: JSON.stringify({ notes }) }),

  // Business Builder
  generateBusinessPlan: (body: { ideaTitle: string; rawDescription: string; targetAudience?: string }) =>
    request<any>('/business/generate', { method: 'POST', body: JSON.stringify(body) }),
  getMyBusinessIdeas: () => request<any>('/business/my-ideas'),

  // Skill Passport
  getSkillPassport: () => request<any>('/skill-passport'),
  addSkillToPassport: (body: { skill_name: string; category?: string; level?: string }) =>
    request<any>('/skill-passport/add-skill', { method: 'POST', body: JSON.stringify(body) }),

  // Dashboard Overview
  getDashboardOverview: () => request<any>('/dashboard/overview'),

  // Settings & Admin
  getSettings: () => request<any>('/settings'),
  saveSettings: (body: { apiKey?: string; model?: string }) => request<any>('/settings', { method: 'POST', body: JSON.stringify(body) }),
  resetDemoData: () => request<any>('/settings/reset-demo', { method: 'POST' }),
  getAdminStats: () => request<any>('/admin/stats'),
  // Notifications (Module 50)
  getNotifications: () => request<{ notifications: any[]; unreadCount: number }>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PUT' }),
  deleteNotification: (id: string) => request<any>(`/notifications/${id}`, { method: 'DELETE' }),

  // Mentor Inquiries & Management (Module 18 & 30)
  getIncomingMentorRequests: () => request<{ requests: any[] }>('/mentors/incoming-requests'),
  respondMentorRequest: (id: string, status: 'accepted' | 'declined' | 'completed', response_notes?: string) =>
    request<any>(`/mentors/requests/${id}/respond`, { method: 'PUT', body: JSON.stringify({ status, response_notes }) }),

  // Opportunity Posting (Module 16 & 30)
  createOpportunity: (body: any) => request<any>('/opportunities', { method: 'POST', body: JSON.stringify(body) }),

  // Comprehensive Admin Console (Module 30 & 48)
  getAdminUsers: () => request<{ users: any[] }>('/admin/users'),
  updateUserRole: (id: string, role: string) => request<any>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getAdminReports: () => request<{ reports: any[] }>('/admin/reports'),
  handleReportAction: (id: string, action: 'dismiss' | 'delete_post') =>
    request<any>(`/admin/reports/${id}/action`, { method: 'PUT', body: JSON.stringify({ action }) }),
  getAdminMentors: () => request<{ mentors: any[] }>('/admin/mentors'),
  toggleMentorVerification: (id: string) => request<any>(`/admin/mentors/${id}/verify`, { method: 'PUT' }),
  getAdminOrganizations: () => request<{ organizations: any[]; opportunities: any[] }>('/admin/organizations'),

  // -------------------------------------------------------------
  // AUTHORITATIVE COMPANY JOURNEY APIS
  // -------------------------------------------------------------
  // AI Career DNA & 3P Analysis
  getCareerDnaQuestions: () => request<any>('/career-dna/questions'),
  getCareerDna: () => request<{ hasDna: boolean; dna: any }>('/career-dna'),
  evaluateCareerDna: (responses: any) =>
    request<any>('/career-dna/evaluate', { method: 'POST', body: JSON.stringify({ responses }) }),
  getThreePAnalysis: () => request<{ threeP: any; context: any }>('/3p-analysis'),

  // Skill Gap Identification
  getSkillGaps: (careerId?: string) =>
    request<any>(careerId ? `/skill-gaps/${careerId}` : '/skill-gaps'),

  // Career Readiness Score
  getCareerReadiness: () => request<any>('/readiness/score'),

  // Project-Based Learning
  getProjects: () => request<{ projects: any[]; activeGoal?: string }>('/projects'),
  submitProject: (body: { projectId?: string; projectTitle: string; category?: string; deliverableUrl: string; deliverableNotes?: string }) =>
    request<any>('/projects/submit', { method: 'POST', body: JSON.stringify(body) }),

  // Industry Exposure
  getIndustryExposure: () => request<{ opportunities: any[]; userActivities: any[] }>('/industry-exposure'),
  logIndustryActivity: (body: { activityType: string; title: string; organization: string; date?: string; status?: string; isVerified?: number; notes?: string }) =>
    request<any>('/industry-exposure/log', { method: 'POST', body: JSON.stringify(body) }),

  // Career Launch Pathways (Placement, Higher Studies, Entrepreneurship, Freelancing)
  getCareerLaunch: () => request<{ activePlan: any; availableTemplates: any; activeGoal?: string }>('/career-launch'),
  selectCareerLaunchPathway: (pathwayType: string, targetRole?: string) =>
    request<any>('/career-launch/select', { method: 'POST', body: JSON.stringify({ pathwayType, targetRole }) }),
  updateLaunchMilestone: (milestoneId: string, completed: boolean) =>
    request<any>('/career-launch/milestone', { method: 'PATCH', body: JSON.stringify({ milestoneId, completed }) }),
};
