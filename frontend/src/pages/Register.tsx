import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, VStack, Heading, Text, Link } from '@chakra-ui/react';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuthStore } from '../store/authStore';
import type { RegisterCredentials } from '../types';

export const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const handleRegister = async (credentials: RegisterCredentials) => {
    await register(credentials);
    navigate('/projects');
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="center">
        <Heading>Create Account</Heading>
        <AuthForm
          type="register"
          onSubmit={handleRegister}
          isLoading={isLoading}
        />
        <Text>
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="blue.500">
            Login here
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}; 