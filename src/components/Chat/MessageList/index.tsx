import { useEffect, useRef } from "react";
import type { Message } from "../../../modules/messages/message.entity";
import "./index.css";
import TypingIndicator from "../TypingIndicator";

interface MessageListProps {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
}

export default function MessageList({
  messages,
  streamingText,
  isStreaming,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="message-list">
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <div
            className={`message-item message-item-${isUser ? "user" : "ai"}`}
            key={message.id}
          >
            <div
              className={`message-content-stack stack-${isUser ? "user" : "ai"}`}
            >
              {message.imageUrl && <img src={message.imageUrl} alt="image" />}
              {message.content && (
                <div
                  className={`message-bubble message-${isUser ? "user" : "ai"}`}
                >
                  {message.content}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {(isStreaming || streamingText) && (
        <div className="message-item mesage-item-ai">
          <div className="message-bubble message-ai">
            {streamingText}
            {isStreaming && !streamingText && <TypingIndicator />}
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
