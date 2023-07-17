'use client';

import ReaderContent from '@/components/Reader/ReaderContent';
import SpeechController from '@/components/Reader/SpeechController';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';
import { FormatedContent } from '@/spec/ReaderType';
import { parseContent } from '@/util/readerUtil';
import { Button } from '@chakra-ui/button';
import { Box, Container, Flex, VStack, Center } from '@chakra-ui/layout';
import { Textarea, Heading } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

const testContent = `“斗之力，三段！”
    望着测验魔石碑上面闪亮得甚至有些刺眼的五个大字，少年面无表情，唇角有着一抹自嘲。紧握的手掌，因为大力，而导致略微尖锐的指甲深深的刺进了掌心之中，带来一阵阵钻心的疼痛…
    “萧炎，斗之力，三段！级别：低级！”测验魔石碑之旁，一位中年男子，看了一眼碑上所显示出来的信息，语气漠然的将之公布了出来…
    中年男子话刚刚脱口，便是不出意外的在人头汹涌的广场上带起了一阵嘲讽的骚动。`;

const testEnglishContent = `Sample content:
"Dou Zhi Li(1), 3rd stage!"
Facing the Magical Testing Monument as it displayed the 5 big hurtful words, the youth stood expressionless, lips curled in a small self-ridiculing smile. He tightly clenched his fist and because of the strength used, his slightly sharp fingernails dug deep into the palm of his hand, bringing brief moments of pain.
"Xiao Yan, Dou Zhi Li, 3rd stage! Rank: Low!" Beside the Magical Testing Monument, a middle-aged man looked at the results on the monument and announced them with an indifferent voice.
Immediately after the middle-aged man finished speaking, without much surprise, the people in the square started a commotion, ridiculing him.`;

export default function Reader() {
  const [content, setContent] = useState<FormatedContent>([]);
  const [inputContent, setInputContent] = useState<string>('');
  const speechSynthesisControl = useSpeechSynthesis(content);

  const { isPlaying, speechAnchor, handleResetSpeech } = speechSynthesisControl;

  useEffect(() => {
    setContent(parseContent(testEnglishContent));
  }, []);

  const handleApplyCustomContent = useCallback(() => {
    handleResetSpeech();
    setContent(parseContent(inputContent));
  }, [inputContent, handleResetSpeech]);

  const handleResetContent = useCallback(() => {
    handleResetSpeech();
    setContent(parseContent(testEnglishContent));
    setInputContent('');
  }, [handleResetSpeech]);

  return (
    <Container maxW="container.md">
      <Center>
        <Heading size="md" mt="20px" color="gray.700">
          A simple reader that reads text aloud
        </Heading>
      </Center>
      <ReaderContent
        content={content}
        speechAnchor={speechAnchor}
        highlightSpeechAnchor={isPlaying}
      />
      <SpeechController {...speechSynthesisControl} />
      <Box bgColor="brown.50" p="4" borderRadius="8" my="20px">
        <Flex h="80px">
          <Textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            resize="none"
            placeholder="Try your own content here"
          ></Textarea>
          <VStack ml="10px">
            <Button colorScheme="pink" onClick={handleApplyCustomContent}>
              Apply
            </Button>
            <Button
              variant="ghost"
              colorScheme="pink"
              onClick={handleResetContent}
            >
              Reset
            </Button>
          </VStack>
        </Flex>
      </Box>
    </Container>
  );
}
