import { FormatedContent, SpeechAnchor } from '@/spec/ReaderType';
import { Text, Box } from '@chakra-ui/layout';
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
        <Text
          key={`line-${lineIdx}`}
          _notFirst={{ mt: '0.8rem' }}
          lineHeight="1.8"
        >
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

  return (
    <Box bgColor="brown.50" p="4" borderRadius="8" my="20px">
      {memorizedContent}
    </Box>
  );
}
