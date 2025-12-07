export default function PartyCard({ party, onJoin }) {
  return (
    <div
      className="
      p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl
      shadow-[0_0_25px_rgba(0,255,255,0.15)]
      flex flex-col gap-3 hover:bg-white/15 transition
    "
    >
      <h2 className="text-2xl font-semibold text-cyan-300">{party.name}</h2>
      <p className="text-gray-300 text-sm">{party.description || "No description"}</p>

      <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
        <span><i className="ri-user-line mr-1"></i>Host: {party.host?.username}</span>
        <span><i className="ri-group-line mr-1"></i>{party.participantsCount} joined</span>
      </div>

      <button
        onClick={onJoin}
        className="
          mt-3 py-2 rounded-xl
          bg-purple-500/20 border border-purple-500/40 backdrop-blur-xl
          text-purple-200 hover:bg-purple-500/30 transition
          shadow-[0_0_20px_rgba(180,0,255,0.25)]
        "
      >
        Join Party
      </button>
    </div>
  );
}
