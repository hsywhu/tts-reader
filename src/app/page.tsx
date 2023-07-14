'use client';

import { Button } from '@chakra-ui/button';
import { Center, Container } from '@chakra-ui/layout';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <Container maxW="container.xl" h="full">
      <Center h="full">
        <Button
          colorScheme="teal"
          onClick={() => {
            router.push('/reader');
          }}
        >
          Reader
        </Button>
      </Center>
    </Container>
  );
}
