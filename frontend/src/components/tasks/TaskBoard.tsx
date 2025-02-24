import { useEffect } from 'react';
import {
  Grid,
  GridItem,
  VStack,
  Heading,
  Box,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../../store/taskStore';
import { socketService } from '../../services/socket';
import type { Task } from '../../types';

interface TaskBoardProps {
  projectId: string;
  onEditTask: (task: Task) => void;
}

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' }
] as const;

export const TaskBoard = ({ projectId, onEditTask }: TaskBoardProps) => {
  const { tasks, fetchProjectTasks, updateTask, deleteTask, isLoading } = useTaskStore();
  const columnBg = useColorModeValue('gray.50', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    fetchProjectTasks(projectId);

    // Connect to socket and join project room
    const socket = socketService.connect();
    socketService.joinProject(projectId);

    // Listen for task updates
    socketService.onTaskUpdated((updatedTask) => {
      if (updatedTask.project === projectId) {
        fetchProjectTasks(projectId);
        toast({
          title: 'Task Updated',
          description: `Task "${updatedTask.title}" has been updated`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    });

    // Listen for new tasks
    socketService.onTaskCreated((newTask) => {
      if (newTask.project === projectId) {
        fetchProjectTasks(projectId);
        toast({
          title: 'New Task',
          description: `Task "${newTask.title}" has been created`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    });

    // Listen for deleted tasks
    socketService.onTaskDeleted((taskId) => {
      fetchProjectTasks(projectId);
      toast({
        title: 'Task Deleted',
        description: 'A task has been deleted',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    });

    // Cleanup
    return () => {
      socketService.leaveProject(projectId);
      socketService.cleanup();
    };
  }, [projectId, fetchProjectTasks, toast]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
      // Socket will handle the update notification
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      // Socket will handle the delete notification
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getColumnTasks = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  if (isLoading) {
    return <Box>Loading tasks...</Box>;
  }

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={6} w="100%">
      {COLUMNS.map(column => (
        <GridItem key={column.id}>
          <VStack
            align="stretch"
            p={4}
            bg={columnBg}
            borderRadius="lg"
            minH="500px"
          >
            <Heading size="md" mb={4}>
              {column.label} ({getColumnTasks(column.id).length})
            </Heading>
            <VStack align="stretch" spacing={4}>
              {getColumnTasks(column.id).map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </VStack>
          </VStack>
        </GridItem>
      ))}
    </Grid>
  );
}; 