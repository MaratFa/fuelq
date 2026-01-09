/**
 * Type definitions for the FuelQ application
 */

// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // Only when creating/updating
  firstName?: string;
  lastName?: string;
  role?: string;
  dateJoined?: number;
  lastLogin?: number;
  bio?: string;
  interests?: string;
  avatar?: string;
  emailNotifications?: boolean;
  themePreference?: string;
  language?: string;
}

// Authentication related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: Omit<User, 'password'>;
}

// Forum related types
export interface Thread {
  id: number;
  title: string;
  content: string;
  author: string;
  category?: string;
  createdAt?: string | Date;
  viewCount?: number;
  commentCount?: number;
  comments?: Post[];
}

export interface Post {
  id: number;
  thread_id: number;
  content: string;
  author: string;
  created_at?: string | Date;
}

// Discovery content types
export interface TrendingTopic {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  views: number;
  comments: number;
  trend: string;
  icon: string;
  color: string;
}

export interface Expert {
  id: number;
  name: string;
  title: string;
  organization?: string;
  bio: string;
  avatar: string;
  expertise: string[];
  followers: number;
  articles?: number;
  following?: boolean;
}

export interface ContentItem {
  id: number;
  type: 'article' | 'discussion' | 'resource';
  title: string;
  description: string;
  excerpt?: string;
  category: string;
  author: string;
  date: string;
  readTime?: string;
  views?: number;
  likes?: number;
  comments?: number;
  image?: string;
  thumbnail?: string;
  url?: string;
}

export interface DiscoveryContent {
  trendingTopics: TrendingTopic[];
  featuredExperts: Expert[];
  recommendedContent: ContentItem[];
  personalizedRecommendations?: ContentItem[];
}

// API response types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

// Module system types
export interface BaseModuleConfig {
  dependencies?: string[];
}

export interface ModuleInstance {
  name: string;
  init?: () => void;
  destroy?: () => void;
}

// Event types
export interface CustomEvent extends Event {
  detail?: any;
}

// Settings types
export interface UserSettings {
  emailNotifications: boolean;
  themePreference: string;
  language: string;
}
