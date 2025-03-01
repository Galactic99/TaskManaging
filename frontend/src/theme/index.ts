import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%',
      },
      'body.chakra-ui-light': {
        display: 'block',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      },
    },
  },
});

export default theme; 