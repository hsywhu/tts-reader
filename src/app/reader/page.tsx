"use client";

import { FormatedContent, parseContent } from "@/util/contentParser";
import { ChangeEvent, ChangeEventHandler, useCallback, useEffect, useState } from "react";
import ReaderContent from "../components/Reader/ReaderContent";

const testContent =
  "主角萧炎，原是萧家历史上空前绝后的斗气修炼天才，4岁就开始修炼斗之气，10岁拥有了九段斗之气，11岁突破十段斗之气，一跃成为家族百年来最年轻的斗者。然而在11岁那年，他却“丧失”了修炼能力，并且斗气逐渐减少，直至三段斗之气。整整三年多时间，家族冷落，旁人轻视，被未婚妻退婚……种种打击接踵而至。";

export default function Reader() {
  const [content, setContent] = useState<FormatedContent | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    setContent(parseContent(testContent));

    // load voices
    const voices = speechSynthesis.getVoices();
    setVoices(voices);
    console.log('voices loaded', voices);
    if (voices.length > 0) {
      setSelectedVoice(voices[0]);
    }
  }, []);

  const handleVoiceSelect = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e?.target?.value;
    const voices = speechSynthesis.getVoices();
    const voice = voices.find((v) => v.name === voiceName);
    if (!voice) return;
    setSelectedVoice(voice);
  }, []);

  return (
    <div>
      <ReaderContent content={content} />
      <select onChange={handleVoiceSelect} value={selectedVoice?.name}>
        {voices.map((voice) => {
          return <option key={voice.name}>{voice.name}</option>;
        })};
      </select>
    </div>
  );
}
