import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlineTrash } from "react-icons/hi2";
import "./index.css";
import type { Conversation } from "../../../modules/conversations/conversation.entity";
import { conversationsAtom } from "../../../modules/conversations/conversation.state";
import { useSetAtom } from "jotai";
import { conversationRepository } from "../../../modules/conversations/conversation.repository";

interface conversaionItemProps {
  conversation: Conversation;
}

export default function ConversationItem(
  conversationItemProps: conversaionItemProps,
) {
  const { conversation } = conversationItemProps;
  const setConversations = useSetAtom(conversationsAtom);
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const isActive = conversationId === conversation.id;
  const deleteConversations = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm("この会話を削除しますか")) return;
    try {
      await conversationRepository.delete(conversation.id);
      setConversations((prev) =>
        prev.filter((item) => item.id !== conversation.id),
      );
      if (isActive) navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Link
      to={`/chats/${conversation.id}`}
      className={`conversation-item ${isActive ? "active" : ""}`}
    >
      <div className="conversation-title">
        {conversation.title ? conversation.title : "新しい会話"}
      </div>
      <button
        className="btn-icon delete-btn"
        onClick={deleteConversations}
        title="削除"
        type="button"
      >
        <HiOutlineTrash />
      </button>
    </Link>
  );
}
