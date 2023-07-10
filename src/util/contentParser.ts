export type FormatedLine = string[];

export type FormatedContent = FormatedLine[];

export const parseContent = (content: string): FormatedContent => {
    // segement content into array of lines
    const lines = content.split('\n');

    // for each line, split by period
    const sentences = lines.map(line => line.split('。'));
    return sentences;
}