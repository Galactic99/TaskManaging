import { Box } from '@chakra-ui/react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box pt="64px">{children}</Box>
    </Box>
  );
}; 