import { useState } from 'react';
import {
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { ProjectList } from '../components/projects/ProjectList';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';

export const Projects = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleProjectCreated = () => {
    onClose();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">My Projects</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Create Project
          </Button>
        </HStack>

        <ProjectList />

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Project</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <CreateProjectForm onSuccess={handleProjectCreated} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}; 