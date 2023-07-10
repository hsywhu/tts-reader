import { FormatedContent } from "@/util/contentParser";
import { useMemo } from "react";

export default function ReaderContent({
  content,
}: {
  content: FormatedContent | null;
}) {
  const memorizedContent = useMemo(() => {
    if (!content) return "";
    return content.map((line, lineIdx) => {
      return (
        <p key={`line-${lineIdx}`}>
          {line.map((sentense, sentenseIdx) => {
            return (
              <span key={`line-${lineIdx}-sentense-${sentenseIdx}`}>
                {sentense}
              </span>
            );
          })}
        </p>
      );
    });
  }, [content]);

  return <div>{memorizedContent}</div>;
}
