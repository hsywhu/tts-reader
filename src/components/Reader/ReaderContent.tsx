import { FormatedContent, SpeechAnchor } from '@/spec/ReaderType';
import { Text } from '@chakra-ui/layout';
import { useMemo } from 'react';

export default function ReaderContent({
  content,
  speechAnchor,
  highlightSpeechAnchor,
}: {
  content: FormatedContent | null;
  speechAnchor: SpeechAnchor;
  highlightSpeechAnchor: boolean;
}) {
  const memorizedContent = useMemo(() => {
    if (!content) return '';
    return content.map((line, lineIdx) => {
      return (
        <Text key={`line-${lineIdx}`} mt="0.8em" lineHeight="1.8">
          <Text as="span">&emsp;&emsp;</Text>
          {line.map((sentense, sentenseIdx) => {
            const isSentensePlaying =
              lineIdx === speechAnchor.line &&
              sentenseIdx === speechAnchor.sentence;
            return (
              <Text
                as="span"
                key={`line-${lineIdx}-sentense-${sentenseIdx}`}
                bgColor={
                  isSentensePlaying && highlightSpeechAnchor
                    ? 'orange.200'
                    : 'transparent'
                }
              >
                {sentense}
              </Text>
            );
          })}
        </Text>
      );
    });
  }, [content, speechAnchor, highlightSpeechAnchor]);

  return <div>{memorizedContent}</div>;
}
