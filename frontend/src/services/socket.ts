import { io, Socket } from 'socket.io-client';
import { Task, Project, User } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // 2 seconds

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
        withCredentials: true
      });

      this.setupSocketListeners();
    }
    return this.socket;
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.connect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.message === 'Authentication error') {
        // Handle authentication error (e.g., token expired)
        this.disconnect();
      }
    });
  }

  private handleReconnect() {
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.disconnect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  joinProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-project', projectId);
    } else {
      console.warn('Socket not connected, attempting to connect...');
      this.connect();
      setTimeout(() => this.joinProject(projectId), 1000);
    }
  }

  leaveProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-project', projectId);
    }
  }

  onTaskUpdated(callback: (task: Task) => void) {
    if (this.socket) {
      this.socket.on('task-updated', callback);
    }
  }

  onTaskCreated(callback: (task: Task) => void) {
    if (this.socket) {
      this.socket.on('task-created', callback);
    }
  }

  onTaskDeleted(callback: (taskId: string) => void) {
    if (this.socket) {
      this.socket.on('task-deleted', callback);
    }
  }

  onProjectUpdated(callback: (project: Project) => void) {
    if (this.socket) {
      this.socket.on('project-updated', callback);
    }
  }

  onMemberAdded(callback: (data: { projectId: string; user: User }) => void) {
    if (this.socket) {
      this.socket.on('member-added', callback);
    }
  }

  emitCursorMove(projectId: string, position: { x: number; y: number }) {
    if (this.socket?.connected) {
      this.socket.emit('cursor-move', {
        projectId,
        position
      });
    }
  }

  onCursorMove(callback: (data: { userId: string; username: string; x: number; y: number }) => void) {
    if (this.socket) {
      this.socket.on('cursor-moved', callback);
    }
  }

  emitChatMessage(projectId: string, message: { text: string; timestamp: number }) {
    if (this.socket?.connected) {
      this.socket.emit('chat-message', {
        projectId,
        message
      });
    }
  }

  onChatMessage(callback: (message: { id: string; userId: string; username: string; text: string; timestamp: number }) => void) {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  cleanup() {
    if (this.socket) {
      this.socket.off('task-updated');
      this.socket.off('task-created');
      this.socket.off('task-deleted');
      this.socket.off('project-updated');
      this.socket.off('member-added');
      this.socket.off('cursor-moved');
      this.socket.off('chat-message');
    }
  }
}

export const socketService = new SocketService(); 