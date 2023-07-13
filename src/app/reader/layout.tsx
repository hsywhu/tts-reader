'use client';

import { Container } from '@chakra-ui/layout';
import { PropsWithChildren } from 'react';

export default function ReaderLayout({ children }: PropsWithChildren<{}>) {
  return (
    <Container maxW="container.md" h="full" bgColor="brown.50">
      {children}
    </Container>
  );
}
