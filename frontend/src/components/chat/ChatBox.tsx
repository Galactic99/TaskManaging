import { useEffect, useRef, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  IconButton,
  Text,
  Avatar,
  useColorModeValue,
  Collapse,
  Button
} from '@chakra-ui/react';
import { ChatIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

interface ChatBoxProps {
  projectId: string;
}

export const ChatBox = ({ projectId }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    socketService.onChatMessage(handleNewMessage);

    return () => {
      socketService.cleanup();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message = {
      text: newMessage,
      timestamp: Date.now()
    };

    socketService.emitChatMessage(projectId, message);
    setNewMessage('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      width="300px"
      zIndex={1000}
    >
      <VStack spacing={0} align="stretch">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
          width="full"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderBottomWidth={isOpen ? '0' : '1px'}
          borderRadius={isOpen ? 'md md 0 0' : 'md'}
          leftIcon={<ChatIcon />}
          rightIcon={isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
          justifyContent="space-between"
        >
          Team Chat
        </Button>

        <Collapse in={isOpen} animateOpacity>
          <Box
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderTop="0"
            borderRadius="0 0 md md"
            overflow="hidden"
          >
            <VStack h="400px" spacing={0}>
              <Box
                flex={1}
                w="full"
                overflowY="auto"
                p={3}
                spacing={3}
                as={VStack}
                align="stretch"
              >
                {messages.map(message => (
                  <Box
                    key={message.id}
                    alignSelf={message.userId === user?._id ? 'flex-end' : 'flex-start'}
                    maxW="80%"
                  >
                    <HStack
                      spacing={2}
                      alignItems="flex-start"
                      flexDirection={message.userId === user?._id ? 'row-reverse' : 'row'}
                    >
                      <Avatar size="xs" name={message.username} />
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          {message.username} • {formatTime(message.timestamp)}
                        </Text>
                        <Box
                          bg={message.userId === user?._id ? 'blue.500' : 'gray.100'}
                          color={message.userId === user?._id ? 'white' : 'black'}
                          px={3}
                          py={2}
                          borderRadius="lg"
                        >
                          <Text fontSize="sm">{message.text}</Text>
                        </Box>
                      </Box>
                    </HStack>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Box
                p={2}
                borderTopWidth="1px"
                borderColor={borderColor}
                as="form"
                onSubmit={handleSendMessage}
              >
                <HStack>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    size="sm"
                  />
                  <IconButton
                    aria-label="Send message"
                    icon={<ChatIcon />}
                    size="sm"
                    type="submit"
                    colorScheme="blue"
                    isDisabled={!newMessage.trim()}
                  />
                </HStack>
              </Box>
            </VStack>
          </Box>
        </Collapse>
      </VStack>
    </Box>
  );
}; 