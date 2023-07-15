import { FormatedContent, SpeechAnchor } from '@/spec/ReaderType';
import { supportedLanguages } from '@/util/constants';
import { getNextSpeechAnchor } from '@/util/readerUtil';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function useSpeechSynthesis(content: FormatedContent) {
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
  const [speechRate, setSpeechRate] = useState<number>(1.3);
  const speechRateRef = useRef<number>(1.3);

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
        if (
          supportedLanguages.includes(voice.lang) &&
          !voiceNameSet.has(voice.name)
        ) {
          filteredVoices.push(voice);
          voiceNameSet.add(voice.name);
        }
      }

      filteredVoices.sort((a, _) => {
        // place Chinese voices on front
        if (a.lang.includes('zh')) return -1;
        else return 0;
      });
      setVoices(filteredVoices);
      if (!currentVoice && filteredVoices.length > 0) {
        setCurrentVoice(filteredVoices[0]);
        currentVoiceRef.current = filteredVoices[0];
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
      console.log('already speaking');
      speechSynthesis.cancel();
    }
    console.log('start playing', {
      contentLength: content.length,
      speechAnchor: speechAnchorRef.current,
    });
    if (content) {
      console.log(
        content[speechAnchorRef.current.line][speechAnchorRef.current.sentence]
      );
      const utter = new SpeechSynthesisUtterance(
        content[speechAnchorRef.current.line][speechAnchorRef.current.sentence]
      );
      uttersRef.current = [utter];
      utter.voice = currentVoiceRef.current;
      utter.rate = speechRateRef.current;
      utter.pitch = 1;
      utter.volume = 1;
      utter.onend = () => {
        console.log('handle next play');
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

      setSSInterval();

      speechSynthesis.speak(utter);
      console.log('utterance started');
    }
  }

  const handlePause = () => {
    if (ssIntervalRef.current) clearInterval(ssIntervalRef.current);
    speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    console.log('handle resume');
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
      console.log('handle voice select', { isPlaying, isPaused });
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
  };
}
