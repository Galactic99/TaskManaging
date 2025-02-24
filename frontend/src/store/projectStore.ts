import { create } from 'zustand';
import { projects as projectsApi } from '../services/api';
import type { Project } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: { name: string; description: string }) => Promise<void>;
  updateProject: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, email: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await projectsApi.getAll();
      set({ projects: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch projects',
        isLoading: false
      });
    }
  },

  fetchProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await projectsApi.getById(id);
      set({ currentProject: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch project',
        isLoading: false
      });
    }
  },

  createProject: async (projectData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await projectsApi.create(projectData);
      set(state => ({
        projects: [...state.projects, data],
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create project',
        isLoading: false
      });
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await projectsApi.update(id, projectData);
      set(state => ({
        projects: state.projects.map(p => p._id === id ? data : p),
        currentProject: data,
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update project',
        isLoading: false
      });
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await projectsApi.delete(id);
      set(state => ({
        projects: state.projects.filter(p => p._id !== id),
        currentProject: state.currentProject?._id === id ? null : state.currentProject,
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete project',
        isLoading: false
      });
      throw error;
    }
  },

  addMember: async (projectId, email) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await projectsApi.addMember(projectId, email);
      set(state => ({
        projects: state.projects.map(p => p._id === projectId ? data : p),
        currentProject: data,
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to add member',
        isLoading: false
      });
      throw error;
    }
  }
})); 