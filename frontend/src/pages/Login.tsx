import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, VStack, Heading, Text, Link } from '@chakra-ui/react';
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
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="center">
        <Heading>Welcome Back</Heading>
        <AuthForm
          type="login"
          onSubmit={handleLogin}
          isLoading={isLoading}
        />
        <Text>
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="blue.500">
            Register here
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}; 