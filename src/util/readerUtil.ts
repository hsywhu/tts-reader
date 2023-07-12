import { FormatedContent, SpeechAnchor } from "@/spec/ReaderType";

export const parseContent = (content: string): FormatedContent => {
    // segement content into array of lines
    const lines = content.split('\n');

    // split each line into sentences
    // todo: need a better way to handle cases like multiple punctuations sits together
    const sentences = lines.map(line => line.split(/(?<=[.:;。！？])/g));
    return sentences;
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