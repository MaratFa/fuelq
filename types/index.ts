/**
 * Type definitions for the FuelQ application
 */

// User interface
export interface User {
  id: number;
  email: string;
  name: string;
  roles?: string[];
  password?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  interests?: string;
  emailNotifications?: boolean;
  themePreference?: string;
  language?: string;
  avatar?: string;
  dateJoined?: number;
  lastLogin?: number;
  [key: string]: any;
}

// Thread interface for forum posts
export interface Thread {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  category?: string;
  view_count?: number;
  comment_count?: number;
  comments?: Post[];
}

// Post interface for thread comments
export interface Post {
  id: number;
  thread_id: number;
  content: string;
  author: string;
  created_at: Date;
}

// ContentItem interface for saved resources
export interface ContentItem {
  id: number;
  type: string;
  title: string;
  author: string;
  date: string;
  category: string;
  thumbnail: string;
  excerpt: string;
  views: number;
  comments: number;
  description?: string;
  url?: string;
  image?: string;
}

// UserSettings interface for user preferences
export interface UserSettings {
  emailNotifications: boolean;
  themePreference: string;
  language: string;
}

// TrendingTopic interface for discovery page
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
  date?: number;
}

// Expert interface for discovery page
export interface Expert {
  id: number;
  name: string;
  title: string;
  organization?: string;
  bio: string;
  avatar: string;
  expertise: string[];
  followers: number;
  following: boolean;
}

// ChartData interface for engineers page
export interface ChartData {
  efficiency: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  };
  cost: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  };
  scalability: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  };
  landuse: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  };
  capacity: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  };
}
