import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, VStack, Heading, Text, Link, Flex } from '@chakra-ui/react';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials);
    navigate('/projects');
  };

  return (
    <Flex 
      w="100%" 
      h="100%" 
      justify="center" 
      align="center" 
      direction="column"
      m="0"
      p="0"
      overflow="hidden"
    >
      <Box 
        w="100%" 
        maxW="400px" 
        mx="auto" 
        py={10}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <VStack spacing={8} align="center" w="100%">
          <Heading textAlign="center">Welcome Back</Heading>
          <AuthForm
            type="login"
            onSubmit={handleLogin}
            isLoading={isLoading}
          />
          <Text textAlign="center">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="blue.500">
              Register here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}; 