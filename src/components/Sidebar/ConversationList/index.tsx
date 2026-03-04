import { useAtom } from "jotai";
import { conversationsAtom } from "../../../modules/conversations/conversation.state";
import ConversationItem from "../ConversationItem";
import "./index.css";
import { conversationRepository } from "../../../modules/conversations/conversation.repository";
import { useEffect } from "react";

export default function ConversationList() {
  const [conversations, setConversations] = useAtom(conversationsAtom);
  useEffect(() => {
    fetchConversations();
  }, []);
  const fetchConversations = async () => {
    try {
      const data = await conversationRepository.findAll();
      setConversations(data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}
