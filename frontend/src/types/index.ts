export interface User {
  _id: string;
  username: string;
  email: string;
  projects: string[];
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: User;
  members: User[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  assignees: User[];
  project: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface ApiError {
  error: string;
} 