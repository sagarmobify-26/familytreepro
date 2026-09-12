export type UserRole = 'head' | 'contributor' | 'viewer' | 'admin';

export type AppView = 'login' | 'dashboard' | 'visualizer' | 'directory' | 'timeline' | 'archives';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  avatarUrl?: string;
  branchName?: string;
}

export interface RoleOption {
  id: UserRole;
  title: string;
  icon: string;
  tagline: string;
  description: string;
  capabilities: string[];
  badgeColor: string;
}

export interface FamilyActivityUpdate {
  id: string;
  author: string;
  action: string;
  target: string;
  detail: string;
  timestamp: string;
  category: 'member' | 'photo' | 'document' | 'branch';
}
