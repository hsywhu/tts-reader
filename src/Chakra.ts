import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  colors: {
    brown: {
      50: '#f5f1e8',
      100: '#DDBE9F',
      200: '#E0AB80',
      500: '#AE8165',
      700: '#7C5340',
    },
  },
});

export default customTheme;
