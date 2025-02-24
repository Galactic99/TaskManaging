import { useEffect, useState } from 'react';
import { Box, Avatar, Text, useTheme } from '@chakra-ui/react';
import { socketService } from '../../services/socket';
import { throttle } from 'lodash';

interface RemoteCursor {
  userId: string;
  username: string;
  x: number;
  y: number;
  lastUpdate: number;
}

export const CursorTracker = ({ projectId }: { projectId: string }) => {
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      const { clientX, clientY } = e;
      socketService.emitCursorMove(projectId, {
        x: clientX,
        y: clientY
      });
    }, 50); // Throttle to 50ms to reduce network traffic

    const handleCursorUpdate = (data: RemoteCursor) => {
      setCursors(prev => {
        // Remove old cursors (older than 10 seconds)
        const now = Date.now();
        const filtered = prev.filter(
          c => c.userId !== data.userId && now - c.lastUpdate < 10000
        );
        return [...filtered, { ...data, lastUpdate: now }];
      });
    };

    // Setup socket listeners
    socketService.onCursorMove(handleCursorUpdate);
    
    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      socketService.cleanup();
    };
  }, [projectId]);

  // Clean up stale cursors every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => 
        prev.filter(c => Date.now() - c.lastUpdate < 10000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {cursors.map(cursor => (
        <Box
          key={cursor.userId}
          position="fixed"
          left={cursor.x}
          top={cursor.y}
          zIndex={9999}
          pointerEvents="none"
          transition="transform 0.1s ease-out"
        >
          <Box position="relative">
            {/* Custom cursor */}
            <Box
              borderColor={theme.colors.blue[500]}
              borderWidth="2px"
              borderRadius="full"
              w="4"
              h="4"
              position="absolute"
              transform="translate(-50%, -50%)"
            />
            
            {/* User info */}
            <Box
              position="absolute"
              left="10px"
              top="10px"
              bg="white"
              boxShadow="sm"
              borderRadius="md"
              p={2}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Avatar size="xs" name={cursor.username} />
              <Text fontSize="sm">{cursor.username}</Text>
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
}; 