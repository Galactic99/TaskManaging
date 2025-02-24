import { useEffect } from 'react';
import {
  Grid,
  GridItem,
  VStack,
  Heading,
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../../store/taskStore';
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

  useEffect(() => {
    fetchProjectTasks(projectId);
  }, [projectId, fetchProjectTasks]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
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