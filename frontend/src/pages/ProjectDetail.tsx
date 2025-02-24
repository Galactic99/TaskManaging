import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
  Input,
  FormControl,
  FormLabel,
  Divider
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useProjectStore } from '../store/projectStore';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskForm } from '../components/tasks/TaskForm';
import type { Task } from '../types';
import { socketService } from '../services/socket';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    currentProject,
    fetchProject,
    updateProject,
    deleteProject,
    addMember,
    isLoading
  } = useProjectStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: ''
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  
  const {
    isOpen: isAddMemberOpen,
    onOpen: onAddMemberOpen,
    onClose: onAddMemberClose
  } = useDisclosure();
  
  const {
    isOpen: isTaskFormOpen,
    onOpen: onTaskFormOpen,
    onClose: onTaskFormClose
  } = useDisclosure();

  useEffect(() => {
    if (id) {
      fetchProject(id);

      // Connect to socket and join project room
      const socket = socketService.connect();
      socketService.joinProject(id);

      // Listen for project updates
      socketService.onProjectUpdated((updatedProject) => {
        if (updatedProject._id === id) {
          fetchProject(id);
          toast({
            title: 'Project Updated',
            description: 'Project details have been updated',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      });

      // Listen for new members
      socketService.onMemberAdded(({ projectId, user }) => {
        if (projectId === id) {
          fetchProject(id);
          toast({
            title: 'New Team Member',
            description: `${user.username} has joined the project`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      });

      // Cleanup
      return () => {
        socketService.leaveProject(id);
        socketService.cleanup();
      };
    }
  }, [id, fetchProject, toast]);

  useEffect(() => {
    if (currentProject) {
      setEditData({
        name: currentProject.name,
        description: currentProject.description
      });
    }
  }, [currentProject]);

  if (!currentProject || isLoading) {
    return <Text>Loading project...</Text>;
  }

  const handleEdit = async () => {
    try {
      await updateProject(currentProject._id, editData);
      setIsEditing(false);
      // Socket will handle the update notification
    } catch (error: any) {
      toast({
        title: 'Error updating project',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(currentProject._id);
      navigate('/projects');
      toast({
        title: 'Project deleted',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting project',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAddMember = async () => {
    try {
      await addMember(currentProject._id, newMemberEmail);
      setNewMemberEmail('');
      onAddMemberClose();
      // Socket will handle the member added notification
    } catch (error: any) {
      toast({
        title: 'Error adding member',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    onTaskFormOpen();
  };

  const handleTaskFormSuccess = () => {
    onTaskFormClose();
    setSelectedTask(undefined);
    fetchProject(currentProject._id);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          {isEditing ? (
            <VStack align="stretch" flex={1}>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Project name"
              />
              <Input
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Project description"
              />
              <HStack>
                <Button colorScheme="blue" onClick={handleEdit}>
                  Save
                </Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </HStack>
            </VStack>
          ) : (
            <>
              <VStack align="start">
                <Heading size="lg">{currentProject.name}</Heading>
                <Text color="gray.600">{currentProject.description}</Text>
              </VStack>
              <HStack>
                <IconButton
                  aria-label="Edit project"
                  icon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                />
                <IconButton
                  aria-label="Delete project"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={handleDelete}
                />
              </HStack>
            </>
          )}
        </HStack>

        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Team Members</Heading>
            <Button
              leftIcon={<AddIcon />}
              size="sm"
              onClick={onAddMemberOpen}
            >
              Add Member
            </Button>
          </HStack>
          <AvatarGroup max={5}>
            {currentProject.members.map((member) => (
              <Tooltip key={member._id} label={member.username}>
                <Avatar name={member.username} />
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>

        <Divider />

        <HStack justify="space-between">
          <Heading size="md">Tasks</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setSelectedTask(undefined);
              onTaskFormOpen();
            }}
          >
            Add Task
          </Button>
        </HStack>

        <TaskBoard
          projectId={currentProject._id}
          onEditTask={handleEditTask}
        />

        <Modal isOpen={isAddMemberOpen} onClose={onAddMemberClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Team Member</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Email address</FormLabel>
                <Input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </FormControl>
              <Button
                mt={4}
                colorScheme="blue"
                onClick={handleAddMember}
                isLoading={isLoading}
              >
                Add Member
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isTaskFormOpen}
          onClose={onTaskFormClose}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedTask ? 'Edit Task' : 'Create Task'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <TaskForm
                projectId={currentProject._id}
                members={currentProject.members}
                task={selectedTask}
                onSuccess={handleTaskFormSuccess}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}; 