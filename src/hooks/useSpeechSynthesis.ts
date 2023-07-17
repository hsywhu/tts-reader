import { FormatedContent, SpeechAnchor } from '@/spec/ReaderType';
import { getNextSpeechAnchor, getPrevSpeechAnchor } from '@/util/readerUtil';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSpeechSynthesis {
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  isPlaying: boolean;
  isPaused: boolean;
  speechAnchor: { line: number; sentence: number };
  speechRate: number;
  handleSetSpeechRate: (rate: number) => void;
  handleVoiceSelect: (voice: SpeechSynthesisVoice) => void;
  handlePlay: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleResetSpeech: () => void;
  moveAnchor: ({ isPrev }: { isPrev?: boolean }) => void;
}

export default function useSpeechSynthesis(
  content: FormatedContent
): UseSpeechSynthesis {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(
    null
  );
  const currentVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechAnchorRef = useRef<SpeechAnchor>({
    line: 0,
    sentence: 0,
  });
  const [speechAnchor, setSpeechAnchor] = useState<SpeechAnchor>({
    line: 0,
    sentence: 0,
  });
  const [speechRate, setSpeechRate] = useState<number>(1);
  const speechRateRef = useRef<number>(1);

  const ssIntervalRef = useRef<NodeJS.Timeout>();

  // fix the issue that utterance end event might not be triggered because of GC
  // https://stackoverflow.com/a/35935851
  const uttersRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    const populateVoices = () => {
      // load voices
      const voices = speechSynthesis.getVoices();

      const filteredVoices: SpeechSynthesisVoice[] = [];

      const voiceNameSet = new Set<string>();
      for (const voice of voices) {
        if (!voiceNameSet.has(voice.name)) {
          filteredVoices.push(voice);
          voiceNameSet.add(voice.name);
        }
      }

      setVoices(filteredVoices);
      if (!currentVoice && filteredVoices.length > 0) {
        let defaultVoice = filteredVoices.find((v) => v.default);
        if (!defaultVoice) defaultVoice = filteredVoices[0];
        setCurrentVoice(defaultVoice);
        currentVoiceRef.current = defaultVoice;
      }
    };

    const tearDown = () => {
      speechSynthesis.removeEventListener('voiceschanged', populateVoices);
      speechSynthesis.cancel();
      window.removeEventListener('beforeunload', tearDown);
    };

    populateVoices();
    speechSynthesis.addEventListener('voiceschanged', populateVoices);
    window.addEventListener('beforeunload', () => {
      speechSynthesis.cancel();
    });

    return () => {
      tearDown();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setSSInterval = () => {
    ssIntervalRef.current = setInterval(() => {
      if (!speechSynthesis.speaking) {
        clearInterval(ssIntervalRef.current);
      } else {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
    }, 14000);
  };

  const clearSSInterval = () => {
    if (ssIntervalRef.current) clearInterval(ssIntervalRef.current);
  };

  function handlePlay() {
    if (!isPlaying) setIsPlaying(true);
    clearSSInterval();
    if (isPaused) {
      setIsPaused(false);
    } else if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    if (content) {
      const utter = new SpeechSynthesisUtterance(
        content[speechAnchorRef.current.line][speechAnchorRef.current.sentence]
      );
      uttersRef.current = [utter];
      utter.voice = currentVoiceRef.current;
      utter.rate = speechRateRef.current;
      utter.pitch = 1;
      utter.volume = 1;
      utter.onend = () => {
        const nextSpeechAnchor = getNextSpeechAnchor(
          content,
          speechAnchorRef.current
        );
        if (!nextSpeechAnchor) {
          setIsPlaying(false);
          return;
        }
        speechAnchorRef.current = nextSpeechAnchor;
        setSpeechAnchor(nextSpeechAnchor);
        handlePlay();
      };

      setSSInterval();

      speechSynthesis.speak(utter);
    }
  }

  const handlePause = () => {
    if (ssIntervalRef.current) clearInterval(ssIntervalRef.current);
    speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.resume();
      setSSInterval();
      setIsPaused(false);
    } else {
      handlePlay();
    }
  };

  const handleResetSpeech = () => {
    setIsPlaying(false);
    setIsPaused(false);
    speechSynthesis.cancel();
    speechAnchorRef.current = {
      line: 0,
      sentence: 0,
    };
    setSpeechAnchor({
      line: 0,
      sentence: 0,
    });
  };

  const handleVoiceSelect = useCallback(
    (selectedVoice: SpeechSynthesisVoice) => {
      setCurrentVoice(selectedVoice);
      currentVoiceRef.current = selectedVoice;
      speechSynthesis.cancel();
      if (isPlaying && !isPaused) {
        handlePlay();
      }
    },
    [isPlaying, isPaused] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSetSpeechRate = useCallback(
    (rate: number) => {
      setSpeechRate(rate);
      speechRateRef.current = rate;
      speechSynthesis.cancel();
      if (isPlaying && !isPaused) {
        handlePlay();
      }
    },
    [isPlaying, isPaused] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const moveAnchor = ({ isPrev }: { isPrev?: boolean }) => {
    speechSynthesis.cancel();
    const nextSpeechAnchor = isPrev
      ? getPrevSpeechAnchor(content, speechAnchorRef.current)
      : getNextSpeechAnchor(content, speechAnchorRef.current);
    if (nextSpeechAnchor) {
      speechAnchorRef.current = nextSpeechAnchor;
      setSpeechAnchor(nextSpeechAnchor);
    }
    if (isPlaying && !isPaused) handlePlay();
  };

  return {
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
    moveAnchor,
  };
}
