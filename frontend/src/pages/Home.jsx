export default function Home() {
  return (
    <div className="
      min-h-screen text-white
      bg-gradient-to-br from-[#050505] via-[#0a0f1f] to-[#1b0f2f]
      flex flex-col items-center pt-28 px-6
    ">
      {/* HERO SECTION */}
      <h1 className="
        text-5xl md:text-7xl font-extrabold text-center
        text-transparent bg-clip-text 
        bg-gradient-to-r from-cyan-400 to-purple-500
        drop-shadow-[0_0_25px_rgba(0,200,255,0.4)]
        leading-tight
      ">
        Watch Together.
        <br />
        Learn. Share. Enjoy.
      </h1>

      <p className="text-lg md:text-xl text-gray-300 mt-6 max-w-2xl text-center">
        Sync videos, share screens, collaborate on whiteboards, chat in real-time — 
        experience movies, study sessions, and events together from anywhere.
      </p>

      <div className="mt-10 flex gap-4">
        <a
          href="/login"
          className="
            px-8 py-3 rounded-2xl text-lg
            bg-cyan-500/20 border border-cyan-500/40
            text-cyan-300 hover:bg-cyan-500/30 transition
            shadow-[0_0_20px_rgba(0,255,255,0.3)]
          "
        >
          Get Started →
        </a>

        <a
          href="/register"
          className="
            px-8 py-3 rounded-2xl text-lg
            bg-purple-600/20 border border-purple-500/40
            text-purple-200 hover:bg-purple-600/30 transition
            shadow-[0_0_20px_rgba(180,0,255,0.3)]
          "
        >
          Create Account
        </a>
      </div>

      {/* FEATURES SECTION */}
      <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full">
        {[
          {
            title: "Live Sync Playback",
            icon: "ri-play-circle-line",
            desc: "Watch videos together with zero delay, perfectly in sync.",
          },
          {
            title: "Real-Time Collaboration",
            icon: "ri-pencil-ruler-2-line",
            desc: "Whiteboard, chat, screen share — all in real-time.",
          },
          {
            title: "Host Powerful Rooms",
            icon: "ri-team-line",
            desc: "Create public or private rooms with full host control.",
          },
        ].map((box, i) => (
          <div
            key={i}
            className="
              p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl
              shadow-[0_0_25px_rgba(0,255,255,0.1)] hover:bg-white/15 transition
              flex flex-col items-center text-center gap-4
            "
          >
            <i className={`${box.icon} text-4xl text-cyan-300`}></i>
            <h3 className="text-xl font-semibold">{box.title}</h3>
            <p className="text-gray-300 text-sm">{box.desc}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="mt-24 mb-10 text-gray-400 text-sm">
        © {new Date().getFullYear()} WatchParty — A project idea by Alok Bhadauria
      </footer>
    </div>
  );
}
