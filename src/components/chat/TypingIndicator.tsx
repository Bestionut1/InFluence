interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator = ({ isVisible }: TypingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-1.5 py-4 px-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-600 to-ocean-700 flex items-center justify-center flex-shrink-0 border-0 ring-0">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-ocean-200 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-ocean-200 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-ocean-200 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

interface StreamRendererProps {
  text: string;
  isStreaming: boolean;
}

export const StreamRenderer = ({ text, isStreaming }: StreamRendererProps) => {
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {text}
      {isStreaming && (
        <span className="inline-block w-2 h-5 ml-1 bg-ocean-300 animate-pulse" />
      )}
    </div>
  );
};
