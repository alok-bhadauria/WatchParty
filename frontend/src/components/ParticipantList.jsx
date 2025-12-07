export default function ParticipantList({ participants, compact = false }) {
  const containerClasses = `
    h-full flex flex-col
    rounded-2xl bg-white/5 border border-white/15
    backdrop-blur-xl overflow-hidden
  `;

  return (
    <div className={containerClasses}>
      {/* TITLE BAR */}
      <div
        className="
          flex items-center justify-between
          px-4 py-2 border-b border-white/10 bg-white/10
        "
      >
        <div className="flex items-center gap-2">
          <i className="ri-team-line text-purple-300" />
          <span className="text-sm font-semibold text-purple-200">
            Participants
          </span>
        </div>
        <span className="text-xs text-gray-300">
          {participants.length}
        </span>
      </div>

      {/* LIST */}
      <div
        className={`
          flex-1 min-h-0 overflow-y-auto custom-scroll
          p-4 flex flex-col gap-3
        `}
      >
        {participants.map((p) => {
          const isHost = p.isHost;

          return (
            <div
              key={p.participantId || p._id || p.socketId}
              className="
                p-3 rounded-xl bg-white/10 border border-white/20
                flex items-center gap-3
                opacity-0 animate-fade-slide-in
              "
            >
              <i className="ri-user-3-fill text-cyan-300 text-xl"></i>

              <div className="flex items-center gap-2">
                <span className="text-gray-200">
                  {p.displayName || "Guest"}
                </span>

                {isHost && (
                  <span
                    className="
                      text-[10px] px-2 py-[2px] rounded-full 
                      bg-purple-600/30 border border-purple-400/40 
                      text-purple-200 font-semibold
                      shadow-[0_0_6px_rgba(180,0,255,0.5)]
                      animate-pulse
                    "
                  >
                    HOST
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
