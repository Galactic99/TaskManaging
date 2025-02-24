import { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  HStack,
  useToast,
  FormErrorMessage
} from '@chakra-ui/react';
import { useTaskStore } from '../../store/taskStore';
import type { Task, User } from '../../types';

interface TaskFormProps {
  projectId: string;
  members: User[];
  task?: Task;
  onSuccess: () => void;
}

export const TaskForm = ({ projectId, members, task, onSuccess }: TaskFormProps) => {
  const { createTask, updateTask, isLoading } = useTaskStore();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    assignees: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignees: task.assignees.map(a => a._id)
      });
    }
  }, [task]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const taskData = {
        ...formData,
        projectId
      };

      if (task) {
        await updateTask(task._id, taskData);
        toast({
          title: 'Task updated',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        await createTask(taskData);
        toast({
          title: 'Task created',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssigneesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, assignees: selectedOptions }));
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} align="stretch">
      <FormControl isRequired isInvalid={!!errors.title}>
        <FormLabel>Title</FormLabel>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
        />
        <FormErrorMessage>{errors.title}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          resize="vertical"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Status</FormLabel>
        <Select name="status" value={formData.status} onChange={handleChange}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Due Date</FormLabel>
        <Input
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Assignees</FormLabel>
        <Select
          multiple
          value={formData.assignees}
          onChange={handleAssigneesChange}
          height="100px"
        >
          {members.map(member => (
            <option key={member._id} value={member._id}>
              {member.username}
            </option>
          ))}
        </Select>
      </FormControl>

      <HStack justify="flex-end" pt={4}>
        <Button type="submit" colorScheme="blue" isLoading={isLoading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </HStack>
    </VStack>
  );
}; 