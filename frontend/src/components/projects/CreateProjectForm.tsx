import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useProjectStore } from '../../store/projectStore';

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export const CreateProjectForm = ({ onSuccess }: CreateProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { createProject, isLoading } = useProjectStore();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      toast({
        title: 'Project created',
        description: 'Your project has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setFormData({ name: '', description: '' });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create project',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Project Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter project description"
            resize="vertical"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          isLoading={isLoading}
        >
          Create Project
        </Button>
      </VStack>
    </Box>
  );
}; 