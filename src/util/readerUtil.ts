import { FormatedContent, SpeechAnchor } from '@/spec/ReaderType';

export const parseContent = (content: string): FormatedContent => {
  // segement content into array of lines
  const lines = content.split('\n');

  // split each line into sentences
  if (Intl?.Segmenter) {
    // if browser support Intl.Segmenter, use it to split sentences
    const segmenter = new Intl.Segmenter('zh', { granularity: 'sentence' });
    const sentences = lines.map((line) => {
      const segments = Array.from(segmenter.segment(line));
      return segments.map((segment) => segment.segment);
    });
    return sentences;
  } else {
    // otherwise use regex to split sentences
    return lines.map((line) => line.split(/(?<=[.:;。！？]+)/g));
  }
};

export const getNextSpeechAnchor = (
  content: FormatedContent,
  anchor: SpeechAnchor
): SpeechAnchor | null => {
  let { line: newLine, sentence: newSentence } = anchor;
  newSentence++;
  while (newLine < content.length) {
    while (newSentence < content[newLine].length) {
      if (content[newLine][newSentence].length > 0)
        return { line: newLine, sentence: newSentence };
      newSentence++;
    }
    newLine++;
    newSentence = 0;
  }
  return null;
};
