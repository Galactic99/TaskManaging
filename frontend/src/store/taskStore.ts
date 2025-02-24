import { create } from 'zustand';
import { tasks as tasksApi } from '../services/api';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  createTask: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    assignees?: string[];
    projectId: string;
  }) => Promise<void>;
  updateTask: (id: string, data: {
    title?: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    dueDate?: string;
    assignees?: string[];
  }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchProjectTasks: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await tasksApi.getProjectTasks(projectId);
      set({ tasks: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch tasks',
        isLoading: false
      });
    }
  },

  createTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await tasksApi.create(taskData);
      set(state => ({
        tasks: [...state.tasks, data],
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create task',
        isLoading: false
      });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await tasksApi.update(id, taskData);
      set(state => ({
        tasks: state.tasks.map(t => t._id === id ? data : t),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update task',
        isLoading: false
      });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await tasksApi.delete(id);
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete task',
        isLoading: false
      });
      throw error;
    }
  }
})); 