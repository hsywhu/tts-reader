'use client';

import ReaderContent from '@/components/Reader/ReaderContent';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';
import { FormatedContent } from '@/spec/ReaderType';
import { speechRateOptions } from '@/util/constants';
import { parseContent } from '@/util/readerUtil';
import { Button } from '@chakra-ui/button';
import { Box, Stack, Container } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { useEffect, useState } from 'react';

const testContent = `“斗之力，三段！”
    望着测验魔石碑上面闪亮得甚至有些刺眼的五个大字。少年面无表情，唇角有着一抹自嘲。紧握的手掌，因为大力。而导致略微尖锐的指甲深深的刺进了掌心之中。带来一阵阵钻心的疼痛…
    “萧炎，斗之力，三段！级别：低级！”测验魔石碑之旁，一位中年男子。看了一眼碑上所显示出来的信息。语气漠然的将之公布了出来…
    中年男子话刚刚脱口。便是不出意外的在人头汹涌的广场上带起了一阵嘲讽的骚动。`;

const testEnglishContent = `‘Dou Zhi Li(1), 3rd stage!’
Facing the Magical Testing Monument as it displayed the 5 big hurtful words, the youth stood expressionless, lips curled in a small self-ridiculing smile. He tightly clenched his fist and because of the strength used, his slightly sharp fingernails dug deep into the palm of his hand, bringing brief moments of pain.
“Xiao Yan, Dou Zhi Li, 3rd stage! Rank: Low!” Beside the Magical Testing Monument, a middle-aged man looked at the results on the monument and announced them with an indifferent voice.
Immediately after the middle-aged man finished speaking, without much surprise, the people in the square started a commotion, ridiculing him.`;

export default function Reader() {
  const [content, setContent] = useState<FormatedContent>([]);
  const {
    voices,
    currentVoice,
    isPlaying,
    isPaused,
    speechAnchor,
    speechRate,
    handleSetSpeechRate,
    handleVoiceSelect,
    handlePlay,
    handlePause,
    handleResume,
    handleResetSpeech,
  } = useSpeechSynthesis(content);

  useEffect(() => {
    setContent(parseContent(testEnglishContent));
  }, []);

  return (
    <Container maxW="container.md" h="full" bgColor="brown.50">
      <Box p={{ base: 2, md: 8 }}>
        <ReaderContent
          content={content}
          speechAnchor={speechAnchor}
          highlightSpeechAnchor={isPlaying}
        />
        <Box mt="100px"></Box>
        <Stack mt="20px" flexDir={{ base: 'column', md: 'row' }}>
          <Menu>
            <MenuButton as={Button} colorScheme="pink">
              {currentVoice?.name || 'Select an voice'}
            </MenuButton>
            <MenuList maxH="320px" overflowY="auto">
              {voices.map((voice) => {
                return (
                  <MenuItem
                    key={voice.name}
                    value={voice.name}
                    onClick={() => handleVoiceSelect(voice)}
                  >
                    {`${voice.name} - ${voice.lang}`}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
          <Button
            colorScheme="pink"
            onClick={
              isPaused ? handleResume : isPlaying ? handlePause : handlePlay
            }
          >
            {isPaused ? 'Resume' : isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button colorScheme="pink" onClick={handleResetSpeech}>
            Reset Speech
          </Button>
          <Menu>
            <MenuButton as={Button} colorScheme="pink">
              {`Speech Rate: x${speechRate}`}
            </MenuButton>
            <MenuList>
              {speechRateOptions.map((rate) => {
                return (
                  <MenuItem
                    key={`speech-rate-option-${rate}`}
                    value={rate}
                    onClick={() => handleSetSpeechRate(rate)}
                  >
                    {`x${rate}`}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        </Stack>
      </Box>
    </Container>
  );
}
