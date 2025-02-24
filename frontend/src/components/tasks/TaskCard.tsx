import {
  Box,
  Text,
  Badge,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AvatarGroup,
  Avatar,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, HamburgerIcon } from '@chakra-ui/icons';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: 'todo' | 'in-progress' | 'done') => void;
}

const statusColors = {
  todo: 'gray',
  'in-progress': 'blue',
  done: 'green'
};

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <HStack justify="space-between" mb={2}>
        <Badge colorScheme={statusColors[task.status]}>
          {task.status.replace('-', ' ').toUpperCase()}
        </Badge>
        <HStack>
          <IconButton
            aria-label="Edit task"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="More options"
              icon={<HamburgerIcon />}
              size="sm"
              variant="ghost"
            />
            <MenuList>
              <MenuItem onClick={() => onStatusChange(task._id, 'todo')}>
                Move to Todo
              </MenuItem>
              <MenuItem onClick={() => onStatusChange(task._id, 'in-progress')}>
                Move to In Progress
              </MenuItem>
              <MenuItem onClick={() => onStatusChange(task._id, 'done')}>
                Move to Done
              </MenuItem>
              <MenuItem
                onClick={() => onDelete(task._id)}
                color="red.500"
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>

      <Text fontWeight="semibold" mb={2}>
        {task.title}
      </Text>
      
      {task.description && (
        <Text color="gray.600" fontSize="sm" mb={3} noOfLines={2}>
          {task.description}
        </Text>
      )}

      <HStack justify="space-between" align="center">
        <AvatarGroup size="sm" max={3}>
          {task.assignees.map(assignee => (
            <Tooltip key={assignee._id} label={assignee.username}>
              <Avatar name={assignee.username} />
            </Tooltip>
          ))}
        </AvatarGroup>

        {task.dueDate && (
          <Text fontSize="sm" color="gray.500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </HStack>
    </Box>
  );
}; 