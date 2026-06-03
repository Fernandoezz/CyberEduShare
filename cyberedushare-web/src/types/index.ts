export type Role = 'student' | 'faculty' | 'moderator' | 'admin';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: Role;
  isVerified: boolean;
  enrolledCourses: string[];
  notificationPreferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    labAlerts: boolean;
    newResourceAlerts: boolean;
  };
  createdAt: string;
}

export interface Content {
  _id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: string;
  tags: string[];
  fileUrl: string;
  uploaderName: string;
  uploadedBy: string;
  isVerified: boolean;
  averageRating: number;
  bookmarks: string[];
  createdAt: string;
}

export interface Question {
  _id: string;
  title: string;
  body: string;
  subject: string;
  tags: string[];
  askedBy: string;
  askedByName: string;
  upvotes: string[];
  answers: Answer[];
  isSolved: boolean;
  createdAt: string;
}

export interface Answer {
  _id: string;
  body: string;
  answeredBy: string;
  answeredByName: string;
  upvotes: string[];
  isAccepted: boolean;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  subject: string;
  techStack: string[];
  submittedBy: string;
  submittedByName: string;
  fileUrl: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  body: string;
  commentedBy: string;
  commentedByName: string;
  createdAt: string;
}

export interface Lab {
  _id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  instructions: string[];
  vmUrl: string;
  vmUsername: string;
  vmPassword: string;
  isActive: boolean;
  completions: { user: string; completedAt: string; timeTaken: number }[];
  createdAt: string;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  flag: string;
  hints: { _id: string; text: string; penalty: number }[];
  solves: { user: string; username: string; pointsEarned: number; solvedAt: string }[];
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  refId: string | null;
  refType: string | null;
  createdAt: string;
}

export interface DashboardStats {
  users: { total: number; students: number; faculty: number; moderators: number; newThisWeek: number };
  content: { total: number; pending: number; newThisWeek: number };
  community: { questions: number; projects: number };
  platform: { challenges: number; labs: number };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  data: T[];
}