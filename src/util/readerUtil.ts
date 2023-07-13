import { FormatedContent, SpeechAnchor } from "@/spec/ReaderType";

export const parseContent = (content: string): FormatedContent => {
    // segement content into array of lines
    const lines = content.split('\n');

    // split each line into sentences
    if (Intl?.Segmenter) {
        // if browser support Intl.Segmenter, use it to split sentences
        const segmenter = new Intl.Segmenter('zh', {granularity: 'sentence'});
        const sentences = lines.map(line => {
            const segments = Array.from(segmenter.segment(line));
            return segments.map(segment => segment.segment);
        });
        return sentences;
    } else {
        // otherwise use regex to split sentences
        return lines.map(line => line.split(/(?<=[.:;。！？]+)/g)); 
    }
}

export const getNextSpeechAnchor = (content: FormatedContent, anchor: SpeechAnchor): SpeechAnchor | null => {
    const {line, sentence} = anchor;
    if (line >= content.length) return null;
    if (sentence >= content[line].length - 1) {
        const newLine = line + 1;
        if (newLine >= content.length) return null;
        return {line: newLine, sentence: 0};
    } else {
        return {line, sentence: sentence + 1};
    }
}