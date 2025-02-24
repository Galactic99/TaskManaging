import axios from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Project,
  Task,
  User
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data
        }
      });
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: (data: RegisterCredentials) => 
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', data),
  
  getCurrentUser: () => 
    api.get<User>('/auth/me')
};

// Projects API
export const projects = {
  create: (data: { name: string; description: string }) =>
    api.post<Project>('/projects', data),
  
  getAll: () =>
    api.get<Project[]>('/projects'),
  
  getById: (id: string) =>
    api.get<Project>(`/projects/${id}`),
  
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<Project>(`/projects/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/projects/${id}`),
  
  addMember: (projectId: string, email: string) =>
    api.post<Project>(`/projects/${projectId}/members`, { email })
};

// Tasks API
export const tasks = {
  create: (data: {
    title: string;
    description?: string;
    dueDate?: string | null;
    assignees?: string[];
    projectId: string;
  }) =>
    api.post<Task>('/tasks', data),
  
  getProjectTasks: (projectId: string, status?: 'todo' | 'in-progress' | 'done') =>
    api.get<Task[]>(`/tasks/project/${projectId}`, {
      params: { status }
    }),
  
  update: (id: string, data: {
    title?: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    dueDate?: string | null;
    assignees?: string[];
  }) => {
    console.log('API update request:', { id, data });
    return api.patch<Task>(`/tasks/${id}`, data);
  },
  
  delete: (id: string) =>
    api.delete(`/tasks/${id}`)
};

export default api; 