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
    dueDate?: string | null;
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
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      const formattedData = {
        ...taskData,
        dueDate: taskData.dueDate || null,
        assignees: taskData.assignees || []
      };
      const { data } = await tasksApi.create(formattedData);
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
      
      // Log the update request
      console.log('Updating task:', { id, taskData });

      // Ensure status is properly formatted
      let formattedData = { ...taskData };
      if (taskData.status) {
        formattedData.status = taskData.status.toLowerCase().replace(/_/g, '-');
      }
      
      // Format other fields
      formattedData = {
        ...formattedData,
        dueDate: taskData.dueDate || null,
        assignees: taskData.assignees || []
      };

      console.log('Formatted update data:', formattedData);

      const { data } = await tasksApi.update(id, formattedData);
      
      console.log('Update response:', data);

      set(state => ({
        tasks: state.tasks.map(t => t._id === id ? data : t),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Task update error:', {
        error: error.response?.data || error.message,
        taskId: id,
        taskData
      });
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