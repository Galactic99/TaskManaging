import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast
} from '@chakra-ui/react';
import type { LoginCredentials, RegisterCredentials } from '../../types';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: LoginCredentials | RegisterCredentials) => Promise<void>;
  isLoading: boolean;
}

export const AuthForm = ({ type, onSubmit, isLoading }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = type === 'login'
        ? { email: formData.email, password: formData.password }
        : formData;
      await onSubmit(submitData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${type}`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box 
      as="form" 
      onSubmit={handleSubmit} 
      width="100%" 
      maxW="400px" 
      mx="auto"
      textAlign="left"
    >
      <VStack spacing={4} align="stretch" w="100%">
        {type === 'register' && (
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          isLoading={isLoading}
        >
          {type === 'login' ? 'Login' : 'Register'}
        </Button>
      </VStack>
    </Box>
  );
}; 