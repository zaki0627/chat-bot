import MessageList from "../MessageList";
import { HiOutlinePaperAirplane, HiOutlinePhoto } from "react-icons/hi2";
import "./index.css";
import { useEffect, useRef, useState } from "react";
import {
  generateConversationTitle,
  startChatSession,
} from "../../../lib/gemini";
import { useParams } from "react-router-dom";
import { messageRepository } from "../../../modules/messages/message.repository";
import { conversationRepository } from "../../../modules/conversations/conversation.repository";
import type { Message } from "../../../modules/messages/message.entity";
import type { ChatSession, Part } from "@google/generative-ai";
import { useSetAtom } from "jotai";
import { conversationsAtom } from "../../../modules/conversations/conversation.state";
import { uploadrepository } from "../../../modules/upload/upload.repository";

export default function ChatContainer() {
  // User asked to comment out conditional rendering parts.
  const [inputText, setInputText] = useState("");
  const { conversationId } = useParams();
  const [isLoading, setIsloading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const chatSessionRef = useRef<ChatSession | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setConversations = useSetAtom(conversationsAtom);
  useEffect(() => {
    fetchMessage(conversationId!);
  }, [conversationId]);

  const fetchMessage = async (conversationId: string) => {
    try {
      const conversation = await conversationRepository.findOne(conversationId);
      setMessages(conversation.messages || []);
      initializeChatSession(conversation.messages || []);
    } catch (error) {
      console.log(error);
    }
  };

  const initializeChatSession = (messages: Message[]) => {
    const history = messages.map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }));
    chatSessionRef.current = startChatSession(history);
  };

  const handeleSend = async () => {
    const currentMessage = inputText.trim();
    setIsloading(true);
    const isFirstMessage = messages.length === 0;
    if (isFirstMessage) {
      generateAndSaveMessage(currentMessage);
    }
    try {
      await createUsermessage(currentMessage);
      setInputText("");
      clearFile();
      await createAiMessage(currentMessage);
    } catch (error) {
      console.log(error);
    } finally {
      setIsloading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルのみアップ可能です。");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateAndSaveMessage = async (message: string) => {
    const title = await generateConversationTitle(message);
    const updatedConversation = await conversationRepository.updateTitle(
      conversationId!,
      title,
    );
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === updatedConversation.id
          ? updatedConversation
          : conversation,
      ),
    );
  };
  const createUsermessage = async (content: string) => {
    let imageUrl;

    if (selectedFile) {
      imageUrl = await uploadrepository.uploadImage(selectedFile);
    }
    const userMessage = await messageRepository.create(conversationId!, {
      role: "user",
      content,
      imageUrl,
    });
    setMessages((prev) => [...prev, userMessage]);
    console.log(userMessage);
  };

  const createAiMessage = async (content: string) => {
    if (!chatSessionRef.current) return;
    let parts: Array<string | Part> = [content];
    if (selectedFile) {
      const image = await fileToGenerativePart(selectedFile);
      parts.push(image);
    }
    const result = await chatSessionRef.current.sendMessageStream(content);
    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      setStreamingText(fullText);
    }
    const aiMessage = await messageRepository.create(conversationId!, {
      role: "assistant",
      content: fullText,
    });
    setMessages((prev) => [...prev, aiMessage]);
    setStreamingText("");

    console.log(aiMessage);
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
  };

  return (
    <div className="chat-container">
      <MessageList
        messages={messages}
        isStreaming={isLoading}
        streamingText={streamingText}
      />

      {/* Integrated Message Input Area */}
      <div className="message-input-container">
        {/* Preview Area - Commented out or toggleable */}
        {previewUrl && (
          <div className="image-preview-container">
            <div className="image-preview-wrapper">
              <img src={previewUrl} alt="preview" className="image-preview" />
              <button className="image-preview-close" onClick={clearFile}>
                ×
              </button>
            </div>
          </div>
        )}

        <div className="message-input-wrapper">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
          <button
            className="icon-button"
            onClick={() => fileInputRef.current?.click()}
            title="画像をアップロード"
          >
            <HiOutlinePhoto size={24} />
          </button>
          <textarea
            className="message-input"
            placeholder="AIにメッセージを送信する..."
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
          />
          <button
            className="send-button"
            onClick={handeleSend}
            disabled={isLoading || (!inputText.trim() && !selectedFile)}
          >
            <HiOutlinePaperAirplane size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
