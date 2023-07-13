import { FormatedContent, SpeechAnchor } from "@/spec/ReaderType";
import { supportedLanguages } from "@/util/constants";
import { getNextSpeechAnchor } from "@/util/readerUtil";
import { useCallback, useEffect, useRef, useState } from "react";

export default function useSpeechSynthesis(content: FormatedContent) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(
    null
  );
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

  useEffect(() => {
    const populateVoices = () => {
      // load voices
      const voices = speechSynthesis.getVoices();
      // only include English or Chinese voices
      const filteredVoices = voices.filter((voice) => {
        return supportedLanguages.includes(voice.lang);
      });
      filteredVoices.sort((a, _) => {
        // place Chinese voices on front
        if (a.lang.includes('zh')) return -1;
        else return 0;
      });
      setVoices(filteredVoices);
      if (!currentVoice && filteredVoices.length > 0) {
        setCurrentVoice(filteredVoices[0]);
      }
    };

    const tearDown = () => {
      speechSynthesis.removeEventListener('voiceschanged', populateVoices);
      speechSynthesis.cancel();
      window.removeEventListener('beforeunload', tearDown);
    }

    populateVoices();
    speechSynthesis.addEventListener('voiceschanged', populateVoices);
    window.addEventListener('beforeunload', () => {
      speechSynthesis.cancel();
    });

    return () => {
      tearDown();
    };
  }, []);

  const handleVoiceSelect = useCallback(
    (selectedVoice: SpeechSynthesisVoice) => {
      setCurrentVoice(selectedVoice);
    },
    []
  );

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
  }

  const handlePlay = () => {
    if (!isPlaying) setIsPlaying(true);
    clearSSInterval();
    if (isPaused) {
        console.log('already paused');
        speechSynthesis.resume();
        setSSInterval();
        setIsPaused(false);
        return;
    } else if (speechSynthesis.speaking) {
      console.log('already speaking');
      speechSynthesis.cancel();
    }
    console.log('start playing', {contentLength: content.length, speechAnchor: speechAnchorRef.current});
    if (content) {
      console.log(content[speechAnchorRef.current.line][speechAnchorRef.current.sentence]);
      const utter = new SpeechSynthesisUtterance(
        content[speechAnchorRef.current.line][speechAnchorRef.current.sentence]
      );
      utter.voice = currentVoice;
      utter.rate = speechRateRef.current;
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

      setSSInterval();

      speechSynthesis.speak(utter);
      console.log('utterance started');
    }
  };

  const handlePause = () => {
    if (ssIntervalRef.current) clearInterval(ssIntervalRef.current);
    speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
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

  const handleSetSpeechRate = (rate: number) => {
    speechRateRef.current = rate;
    setSpeechRate(rate);
  };

  return {
    voices,
    setVoices,
    currentVoice,
    setCurrentVoice,
    isPlaying,
    setIsPlaying,
    speechAnchor,
    setSpeechAnchor,
    speechRate,
    handleSetSpeechRate,
    handleVoiceSelect,
    handlePlay,
    handlePause,
    handleResetSpeech
  }
}