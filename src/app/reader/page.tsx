'use client';

import ReaderContent from '@/components/Reader/ReaderContent';
import { FormatedContent, SpeechAnchor } from '@/spec/ReaderType';
import { getNextSpeechAnchor, parseContent } from '@/util/readerUtil';
import { Button } from '@chakra-ui/button';
import { Box } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { useCallback, useEffect, useRef, useState } from 'react';

const testContent = `三十年河东，三十年河西，莫欺少年穷！ 年仅15岁的萧家废物，于此地，立下了誓言，从今以后便一步步走向斗气大陆巅峰！
  经历了一系列的磨练：收异火，寻宝物，炼丹药，斗魂族。
  最终成为斗帝，为解开斗帝失踪之谜而前往大千世界....
  `;

export default function Reader() {
  const [content, setContent] = useState<FormatedContent | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const speechAnchorRef = useRef<SpeechAnchor>({
    line: 0,
    sentence: 0,
  });
  const [speechAnchor, setSpeechAnchor] = useState<SpeechAnchor>({
    line: 0,
    sentence: 0,
  });
  const ssIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setContent(parseContent(testContent));

    const populateVoices = () => {
      // load voices
      const voices = speechSynthesis.getVoices();
      // only include English or Chinese voices
      const filteredVoices = voices.filter((voice) => {
        return voice.lang.includes('en') || voice.lang.includes('zh');
      });
      filteredVoices.sort((a, _) => {
        // place Chinese voices on front
        if (a.lang.includes('zh')) return -1;
        else return 0;
      });
      setVoices(filteredVoices);
      console.log('voices loaded', voices);
      if (!currentVoice && filteredVoices.length > 0) {
        setCurrentVoice(filteredVoices[0]);
      }
    };

    populateVoices();
    speechSynthesis.addEventListener('voiceschanged', populateVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', populateVoices);
    };
  }, []);

  const handleVoiceSelect = useCallback(
    (selectedVoice: SpeechSynthesisVoice) => {
      setCurrentVoice(selectedVoice);
    },
    []
  );

  const handlePlay = () => {
    setIsPlaying(true);
    if (ssIntervalRef.current) clearInterval(ssIntervalRef.current);

    if (speechSynthesis.speaking) {
      console.log('already speaking');
      speechSynthesis.cancel();
      // return;
    }

    if (content) {
      const utter = new SpeechSynthesisUtterance(
        content[speechAnchorRef.current.line][speechAnchorRef.current.sentence]
      );
      utter.voice = currentVoice;
      utter.rate = 1;
      utter.pitch = 1;
      utter.volume = 1;
      utter.onend = () => {
        console.log('utterance ended');
        const nextSpeechAnchor = getNextSpeechAnchor(
          content,
          speechAnchorRef.current
        );
        if (!nextSpeechAnchor) {
          console.log('utterance ended, no next speech anchor');
          setIsPlaying(false);
          return;
        }
        speechAnchorRef.current = nextSpeechAnchor;
        setSpeechAnchor(nextSpeechAnchor);
        console.log(
          'utterance ended, move to next speech anchor',
          nextSpeechAnchor
        );
        handlePlay();
      };

      ssIntervalRef.current = setInterval(() => {
        console.log('work around', speechSynthesis.speaking);
        if (!speechSynthesis.speaking) {
          clearInterval(ssIntervalRef.current);
        } else {
          speechSynthesis.pause();
          speechSynthesis.resume();
        }
      }, 14000);

      speechSynthesis.speak(utter);
    }
  };

  const handlePause = () => {
    if (ssIntervalRef.current) clearInterval(ssIntervalRef.current);
    speechSynthesis.pause();
    setIsPlaying(false);
  };

  const handleResetAnchor = () => {
    speechAnchorRef.current = {
      line: 0,
      sentence: 0,
    };
    setSpeechAnchor({
      line: 0,
      sentence: 0,
    });
  };

  return (
    <div>
      <ReaderContent content={content} speechAnchor={speechAnchor} />
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
        <Button onClick={handleResetAnchor} ml="10px">
          Reset Speech
        </Button>
      </Box>
    </div>
  );
}
