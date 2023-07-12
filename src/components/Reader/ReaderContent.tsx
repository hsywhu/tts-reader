import { FormatedContent, SpeechAnchor } from '@/spec/ReaderType';
import { Text } from '@chakra-ui/layout';
import { useMemo } from 'react';

export default function ReaderContent({
  content,
  speechAnchor,
}: {
  content: FormatedContent | null;
  speechAnchor: SpeechAnchor;
}) {
  const memorizedContent = useMemo(() => {
    if (!content) return '';
    return content.map((line, lineIdx) => {
      return (
        <Text key={`line-${lineIdx}`}>
          {line.map((sentense, sentenseIdx) => {
            const isSentensePlaying =
              lineIdx === speechAnchor.line &&
              sentenseIdx === speechAnchor.sentence;
            return (
              <Text
                as="span"
                key={`line-${lineIdx}-sentense-${sentenseIdx}`}
                bgColor={isSentensePlaying ? 'orange' : 'transparent'}
              >
                {sentense}
              </Text>
            );
          })}
        </Text>
      );
    });
  }, [content, speechAnchor]);

  return <div>{memorizedContent}</div>;
}
