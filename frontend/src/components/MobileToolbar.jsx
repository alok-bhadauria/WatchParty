export default function MobileToolbar({
  active,
  onSelect,
  participantsCount,
  onLeave,
}) {
  return (
    <div
      className="
        md:hidden fixed bottom-0 left-0 right-0 z-30
        bg-[#050814]/95 border-t border-white/15
        px-3 py-2 flex items-center gap-2
        backdrop-blur-xl
      "
    >
      {/* Main buttons (equal width) */}
      <div className="flex flex-1 gap-2">
        <button
          onClick={() => onSelect("av")}
          className={`
            flex-1 flex items-center justify-center gap-1
            text-xs font-medium rounded-xl py-2
            border
            ${
              active === "av"
                ? "bg-cyan-500/25 border-cyan-500/60 text-cyan-200"
                : "bg-white/5 border-white/20 text-gray-200"
            }
          `}
        >
          <i className="ri-video-chat-line text-sm" />
          AV
        </button>

        <button
          onClick={() => onSelect("chat")}
          className={`
            flex-1 flex items-center justify-center gap-1
            text-xs font-medium rounded-xl py-2
            border
            ${
              active === "chat"
                ? "bg-purple-500/25 border-purple-500/60 text-purple-100"
                : "bg-white/5 border-white/20 text-gray-200"
            }
          `}
        >
          <i className="ri-message-3-line text-sm" />
          Chat
        </button>

        <button
          onClick={() => onSelect("participants")}
          className={`
            flex-1 flex items-center justify-center gap-1
            text-xs font-medium rounded-xl py-2
            border
            ${
              active === "participants"
                ? "bg-emerald-500/25 border-emerald-500/60 text-emerald-100"
                : "bg-white/5 border-white/20 text-gray-200"
            }
          `}
        >
          <i className="ri-group-line text-sm" />
          {participantsCount}
        </button>
      </div>

      {/* Tiny leave button */}
      <button
        onClick={onLeave}
        className="
          flex items-center justify-center
          w-10 h-10 rounded-full
          bg-red-500/20 border border-red-500/50
          text-red-200 text-lg
        "
      >
        <i className="ri-logout-box-r-line" />
      </button>
    </div>
  );
}
