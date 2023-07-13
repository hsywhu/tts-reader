'use client';

import ReaderContent from '@/components/Reader/ReaderContent';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';
import { FormatedContent } from '@/spec/ReaderType';
import { speechRateOptions } from '@/util/constants';
import { parseContent } from '@/util/readerUtil';
import { Button } from '@chakra-ui/button';
import { Box } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { useEffect, useState } from 'react';

const testContent = `2007年，地球基础科学出现了异常的扰动，一时间科学界风雨飘飘，人心惶惶。离奇自杀的科学家，近乎神迹的倒计时，行事隐秘的科学边界，神秘莫测的《三体》游戏……纳米科学家汪淼被警官史强带到联合作战中心，并潜入名为“科学边界”的组织协助调查。
迷雾之中，汪淼接触到一个名为ETO的组织，发现其幕后统帅竟是自杀身亡的科学家杨冬的母亲——叶文洁。随着ETO与作战中心你来我往的不断博弈，汪淼和史强逐渐确定《三体》游戏中的世界真实存在。
而所有事件的源起，是两个文明为了生存空间，孤注一掷的生死相逐。在联合作战中心及科学家们的共同努力下，汪淼、史强等人坚定信念、重燃希望，带领大家继续准备着在今后与即将入侵的三体人展开殊死斗争。`;

export default function Reader() {
  const [content, setContent] = useState<FormatedContent>([]);
  const {
    voices,
    currentVoice,
    isPlaying,
    speechAnchor,
    speechRate,
    handleSetSpeechRate,
    handleVoiceSelect,
    handlePlay,
    handlePause,
    handleResetSpeech,
  } = useSpeechSynthesis(content);

  useEffect(() => {
    setContent(parseContent(testContent));
  }, []);

  return (
    <Box>
      <ReaderContent
        content={content}
        speechAnchor={speechAnchor}
        highlightSpeechAnchor={isPlaying}
      />
      <Box mt="100px"></Box>
      <Box mt="20px">
        <Menu>
          <MenuButton as={Button}>
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
        <Button onClick={isPlaying ? handlePause : handlePlay} ml="10px">
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={handleResetSpeech} ml="10px">
          Reset Speech
        </Button>
        <Menu>
          <MenuButton as={Button} ml="10px">
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
      </Box>
    </Box>
  );
}
