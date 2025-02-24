import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  Heading,
  Badge,
  LinkBox,
  LinkOverlay,
  useColorModeValue
} from '@chakra-ui/react';
import { useProjectStore } from '../../store/projectStore';
import type { Project } from '../../types';

const ProjectCard = ({ project }: { project: Project }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <LinkBox
      as="article"
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
        transition: 'all 0.2s'
      }}
    >
      <VStack align="start" spacing={3}>
        <LinkOverlay as={RouterLink} to={`/projects/${project._id}`}>
          <Heading size="md">{project.name}</Heading>
        </LinkOverlay>
        <Text noOfLines={2} color="gray.600">
          {project.description}
        </Text>
        <Box>
          <Badge colorScheme="blue" mr={2}>
            {project.tasks.length} Tasks
          </Badge>
          <Badge colorScheme="green">
            {project.members.length} Members
          </Badge>
        </Box>
      </VStack>
    </LinkBox>
  );
};

export const ProjectList = () => {
  const { projects, fetchProjects, isLoading, error } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoading) {
    return <Text>Loading projects...</Text>;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (!projects.length) {
    return <Text>No projects found. Create your first project!</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {projects.map(project => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </SimpleGrid>
  );
}; 