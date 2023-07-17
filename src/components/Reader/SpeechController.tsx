import { UseSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { speechRateOptions } from '@/util/constants';
import { Button } from '@chakra-ui/button';
import { Box, Stack, HStack, Center } from '@chakra-ui/layout';
import { Icon, IconButton } from '@chakra-ui/react';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import {
  FaPlay,
  FaStop,
  FaPause,
  FaChevronRight,
  FaChevronLeft,
} from 'react-icons/fa';

export default function SpeechController({
  voices,
  currentVoice,
  isPlaying,
  isPaused,
  speechRate,
  handleSetSpeechRate,
  handleVoiceSelect,
  handlePlay,
  handlePause,
  handleResume,
  handleResetSpeech,
  moveAnchor,
}: UseSpeechSynthesis) {
  return (
    <Box bgColor="brown.50" p="4" borderRadius="8" mt="20px">
      <Center>
        <HStack>
          <IconButton
            colorScheme="pink"
            onClick={() => moveAnchor({ isPrev: true })}
            aria-label="Prev"
            icon={<Icon as={FaChevronLeft} />}
          />
          <IconButton
            colorScheme="pink"
            px="8"
            onClick={
              isPaused ? handleResume : isPlaying ? handlePause : handlePlay
            }
            aria-label={isPaused ? 'Resume' : isPlaying ? 'Pause' : 'Play'}
            icon={
              isPaused ? (
                <Icon as={FaPlay} />
              ) : isPlaying ? (
                <Icon as={FaPause} />
              ) : (
                <Icon as={FaPlay} />
              )
            }
          />
          <IconButton
            colorScheme="pink"
            onClick={() => moveAnchor({ isPrev: false })}
            aria-label="Next"
            icon={<Icon as={FaChevronRight} />}
          />
          <IconButton
            isDisabled={!isPlaying}
            colorScheme="pink"
            onClick={handleResetSpeech}
            aria-label="Reset Speech"
            icon={<Icon as={FaStop} />}
          />
        </HStack>
      </Center>
      <Center mt="10px">
        <Stack flexDir={{ base: 'column', md: 'row' }}>
          <Menu>
            <MenuButton as={Button} colorScheme="pink">
              {'Voice: ' +
                (currentVoice
                  ? `${currentVoice?.name} (${currentVoice?.lang})`
                  : 'Select an voice')}
            </MenuButton>
            <MenuList maxH="320px" overflowY="auto">
              {voices.map((voice) => {
                return (
                  <MenuItem
                    key={voice.name}
                    value={voice.name}
                    onClick={() => handleVoiceSelect(voice)}
                  >
                    {`${voice.name} (${voice.lang})`}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
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
      </Center>
    </Box>
  );
}
