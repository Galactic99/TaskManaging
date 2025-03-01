import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, VStack, Heading, Text, Link, Flex } from '@chakra-ui/react';
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
          <Heading textAlign="center">Create Account</Heading>
          <AuthForm
            type="register"
            onSubmit={handleRegister}
            isLoading={isLoading}
          />
          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="blue.500">
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}; 