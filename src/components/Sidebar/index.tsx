import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import ConversationList from "./ConversationList";
import { conversationRepository } from "../../modules/conversations/conversation.repository";
import { useAtom, useSetAtom } from "jotai";
import { conversationsAtom } from "../../modules/conversations/conversation.state";
import { useNavigate } from "react-router-dom";
import { currentUserAtom } from "../../modules/auth/current-user.state";

export default function Sidebar() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const createConversation = async () => {
    try {
      const conversation = await conversationRepository.create();
      setConversations([conversation, ...conversations]);
      navigate(`/chats/${conversation.id}`);
    } catch (error) {
      console.log(error);
    }
  };
  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(undefined);
  };
  return (
    <div className="sidebar">
      <div style={{ padding: "16px" }}>
        <button
          className="btn-primary"
          style={{ width: "100%" }}
          onClick={createConversation}
        >
          + 新規チャット
        </button>
      </div>
      <ConversationList />

      <div
        style={{
          padding: "16px",
          marginTop: "auto",
          borderTop: "1px solid #E5E5E5",
        }}
      >
        <button
          className="sidebar-item"
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            margin: 0,
          }}
          onClick={logout}
        >
          <HiOutlineArrowRightOnRectangle size={20} />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );
}
