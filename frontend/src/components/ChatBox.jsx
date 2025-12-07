import { useState, useEffect, useContext, useRef } from "react";
import { getMessages, sendMessage } from "../api/messageAPI";
import { SocketContext } from "../context/SocketContext";
import toast from "react-hot-toast";

export default function ChatBox({ partyId, participant, partyName, compact = false }) {
  const socket = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  useEffect(() => {
    getMessages(partyId)
      .then((res) => setMessages(res.data.messages))
      .catch(() => toast.error("Failed to load chat"));
  }, [partyId]);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("chat:new", handler);

    return () => socket.off("chat:new", handler);
  }, [socket]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const msg = {
        party: partyId,
        content: text,
        senderName: participant.displayName,
      };

      const res = await sendMessage(msg);
      socket.emit("chat:send", res.data.message);
      setText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const containerClasses = `
    h-full flex flex-col
    rounded-2xl bg-white/5 border border-white/15
    backdrop-blur-xl overflow-hidden
  `;

  const listPadding = compact ? "px-3 py-2" : "px-4 py-3";
  const formPadding = compact ? "p-2" : "p-3";

  return (
    <div className={`${containerClasses} min-h-0`}>
      {/* TITLE BAR */}
      <div
        className="
          flex items-center justify-between
          px-4 py-2 border-b border-white/10 bg-white/10
        "
      >
        <div className="flex items-center gap-2">
          <i className="ri-chat-3-line text-cyan-300" />
          <span className="text-sm font-semibold text-cyan-200">
            Room Chat
          </span>
        </div>

        <span className="text-xs text-gray-300 truncate max-w-[130px] text-right">
          Room Name : {partyName}
        </span>
      </div>


      {/* MESSAGES */}
      <div
        className={`
          flex-1 min-h-0 overflow-y-auto custom-scroll
          flex flex-col gap-3 ${listPadding}
        `}
      >
        {messages.map((m) => (
          <div key={m._id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-semibold text-sm">
                {m.senderName}
              </span>
              <span className="text-[10px] text-gray-400">
                {formatTime(m.createdAt)}
              </span>
            </div>
            <p className="text-gray-200 text-sm">{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={sendMsg}
        className={`
          flex gap-2 border-t border-white/10
          bg-white/10 backdrop-blur-xl
          min-w-0
          ${formPadding}
        `}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="
            flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/10 border border-white/20
            text-white placeholder-gray-400 text-sm
          "
        />
        <button
          className="
            px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40
            text-cyan-300 hover:bg-cyan-500/30 text-sm
            flex items-center gap-1
          "
        >
          <i className="ri-send-plane-2-line" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
