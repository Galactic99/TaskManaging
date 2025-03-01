import { Box } from '@chakra-ui/react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50" m="0" p="0" overflow="hidden">
      <Navbar />
      <Box pt="64px" m="0" p="0" h="calc(100vh - 64px)" overflow="auto">
        {children}
      </Box>
    </Box>
  );
}; 