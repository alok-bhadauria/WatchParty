import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="
      min-h-screen text-white
      bg-gradient-to-br from-[#050505] via-[#0a0f1f] to-[#1b0f2f]
      flex flex-col items-center pt-28 px-6
    "
    >
      {/* HERO SECTION */}
      <h1
        className="
        text-5xl md:text-7xl font-extrabold text-center
        text-transparent bg-clip-text 
        bg-gradient-to-r from-cyan-400 to-purple-500
        drop-shadow-[0_0_25px_rgba(0,200,255,0.4)]
        leading-tight
      "
      >
        Watch Together.
        <br />
        Learn. Share. Enjoy.
      </h1>

      <p className="text-lg md:text-xl text-gray-300 mt-6 max-w-2xl text-center">
        Sync videos, share screens, collaborate on whiteboards, chat in
        real-time — experience movies, study sessions, and events together from
        anywhere.
      </p>

      {/* BUTTON ROW */}
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Link
          to="/login"
          className="
            px-8 py-3 rounded-2xl text-lg
            bg-cyan-500/20 border border-cyan-500/40
            text-cyan-300 hover:bg-cyan-500/30 transition
            shadow-[0_0_20px_rgba(0,255,255,0.3)]
            flex items-center gap-2
          "
        >
          <i className="ri-login-circle-line text-xl" />
          Login
        </Link>

        <Link
          to="/register"
          className="
            px-8 py-3 rounded-2xl text-lg
            bg-purple-600/20 border border-purple-500/40
            text-purple-200 hover:bg-purple-600/30 transition
            shadow-[0_0_20px_rgba(180,0,255,0.3)]
            flex items-center gap-2
          "
        >
          <i className="ri-user-add-line text-xl" />
          Get Started →
        </Link>

        <Link
          to="/parties"
          className="
            px-8 py-3 rounded-2xl text-lg
            bg-emerald-600/20 border border-emerald-500/40
            text-emerald-200 hover:bg-emerald-600/30 transition
            shadow-[0_0_20px_rgba(0,255,127,0.3)]
            flex items-center gap-2
          "
        >
          <i className="ri-community-line text-xl" />
          See Active Parties
        </Link>
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

      {/* WHY SECTION */}
      <div className="mt-32 max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-6">
          Why WatchParty?
        </h2>

        <p className="text-gray-300 text-lg leading-relaxed">
          Whether you're watching movies with friends, doing online study
          sessions, conducting workshops, or collaborating remotely — WatchParty
          gives you everything you need in one beautifully simple platform.
        </p>
      </div>

      {/* HOW IT WORKS */}
      <div className="mt-20 max-w-5xl grid md:grid-cols-4 gap-8">
        {[
          {
            step: "1",
            title: "Create a Party",
            desc: "Start a room instantly — no downloads, no setup.",
          },
          {
            step: "2",
            title: "Invite Friends",
            desc: "Share the party code. Anyone can join instantly!",
          },
          {
            step: "3",
            title: "Watch & Collaborate",
            desc: "Sync video, chat, whiteboard & media together.",
          },
          {
            step: "4",
            title: "Private Rooms",
            desc: "Password-protected rooms for secure sessions.",
          },
        ].map((box, i) => (
          <div
            key={i}
            className="
              p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl
              flex flex-col items-center gap-4 text-center
            "
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/30 border border-purple-500/40 flex items-center justify-center text-xl font-bold text-purple-200">
              {box.step}
            </div>
            <h3 className="text-lg font-semibold">{box.title}</h3>
            <p className="text-gray-300 text-sm">{box.desc}</p>
          </div>
        ))}
      </div>

      {/* TECH STACK SECTION */}
      <div className="mt-32 max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-10">
          Built With Modern Web Tech
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            {
              icon: "ri-reactjs-line",
              label: "React",
              desc: "Fast component-driven UI powering the frontend.",
            },
            {
              icon: "ri-tailwind-css-line",
              label: "TailwindCSS",
              desc: "Utility-first styling with beautiful effects.",
            },
            {
              icon: "ri-nodejs-line",
              label: "Node.js",
              desc: "Backend runtime enabling JavaScript everywhere.",
            },
            {
              icon: "ri-server-line",
              label: "Express",
              desc: "Fast & minimal server powering all APIs.",
            },
            {
              icon: "ri-database-2-line",
              label: "MongoDB",
              desc: "Cloud database for parties, chat & user data.",
            },
            {
              icon: "ri-cloud-windy-line",
              label: "Socket.IO",
              desc: "Real-time sync for chat, whiteboard & events.",
            },
            {
              icon: "ri-live-line",
              label: "WebRTC",
              desc: "Peer-to-peer AV streaming for calls.",
            },
            {
              icon: "ri-remixicon-line",
              label: "Remix Icons",
              desc: "Modern icons used across the interface.",
            },
            {
              icon: "ri-terminal-window-line",
              label: "Render",
              desc: "Deployment hosting for backend & frontend.",
            },
            {
              icon: "ri-github-line",
              label: "GitHub",
              desc: "Version control & collaboration platform.",
            },
          ].map((tech, i) => (
            <div
              key={i}
              className="
                flex flex-col items-center p-4 rounded-2xl
                bg-white/10 border border-white/20 backdrop-blur-xl
                hover:bg-white/15 transition text-center
              "
            >
              <i className={`${tech.icon} text-4xl text-cyan-300`} />
              <p className="text-gray-300 text-sm mt-2 font-semibold">
                {tech.label}
              </p>
              <p className="text-gray-400 text-xs mt-1">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ========================= FOOTER ========================= */}
      <footer className="mt-32 mb-10 w-full max-w-6xl text-gray-300 text-sm">

        {/* Top full-width divider */}
        <div className="w-full h-px bg-white/10 mb-10"></div>

        {/* GRID WRAPPER (desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-10">

          {/* ---------- ROW 1 (merged 1A + 1B) ---------- */}
          <div className="md:col-span-2 text-center max-w-3xl mx-auto">
            <p className="leading-relaxed">
              WatchParty is a modern real-time collaboration platform designed
              for friends, students, creators, and remote teams. Enjoy synced
              video playback, chat, whiteboard, AV calling, screen sharing and
              powerful room controls — all inside a beautifully crafted
              experience.
            </p>
            <div className="w-full h-px bg-white/10 mt-6"></div>
          </div>

          {/* ====================== ROW 2A — Feedback ====================== */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-white font-semibold mb-2">
                We would love to hear from you
              </h3>
              <p className="text-gray-400 mb-3">
                Feedback / Suggestions / Queries / Reports
              </p>

              <Link
                to="/feedback"
                className="text-emerald-300 hover:text-emerald-400 text-xl px-2"
              >
                <i className="ri-feedback-line" />
              </Link>

              <Link
                to="/feedback"
                className="text-emerald-300 underline hover:text-emerald-400"
              >
                Give Feedback
              </Link>
            </div>

            <div className="w-full h-px bg-white/10 mt-6"></div>
          </div>

          {/* ====================== ROW 2B — GitHub Repository ====================== */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-white font-semibold mb-2">
                GitHub Repository
              </h3>
              <p className="text-gray-400 mb-3">
                Complete source code for WatchParty available on GitHub.
              </p>

              <a
                href="https://github.com/alok-bhadauria/WatchParty"
                className="text-cyan-300 hover:text-cyan-400 text-xl px-2"
              >
                <i className="ri-github-line" />
              </a>
              <a
                href="https://github.com/alok-bhadauria/WatchParty"
                className="text-cyan-300 underline hover:text-cyan-400"
              >
                Click here to visit the repository
              </a>
            </div>

            <div className="w-full h-px bg-white/10 mt-6"></div>
          </div>

          {/* ====================== ROW 3A — Project Highlights ====================== */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-white font-semibold mb-3">Project Highlights</h3>
              <p className="text-gray-400 text-sm">
                Real-time sync engine, custom whiteboard transport, secure
                WebRTC-based AV pipeline, responsive UI, and optimized mobile
                experience — built with performance & simplicity in mind.
              </p>
            </div>
            <div className="w-full h-px bg-white/10 mt-6"></div>
          </div>

          {/* ====================== ROW 3B — Socials ====================== */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-white font-semibold mb-3">
                Let's connect and build together
              </h3>
              <div className="flex gap-6 text-xl">
                <a
                  href="https://www.linkedin.com/in/alok-bhadauria/"
                  className="text-blue-400 hover:text-blue-500"
                >
                  <i className="ri-linkedin-box-line" />
                </a>
                <a
                  href="https://discord.gg/"
                  className="text-cyan-300 hover:text-cyan-400"
                >
                  <i className="ri-discord-line" />
                </a>
                <a
                  href="https://instagram.com/"
                  className="text-pink-400 hover:text-pink-500"
                >
                  <i className="ri-instagram-line" />
                </a>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 mt-6"></div>
          </div>

          {/* ---------- ROW 4 (merged About + Credit) ---------- */}
          <div className="md:col-span-2 text-center max-w-3xl mx-auto">
            <h3 className="text-white font-semibold mb-2">About Me</h3>
            <p className="text-gray-400 leading-relaxed">
              I'm Alok Bhadauria, a passionate developer crafting meaningful
              web apps, open-source tools and AI-driven experiences. Currently
              pursuing B.Tech in Computer Science (AI/ML & IoT), I love building,
              experimenting and creating digital experiences that feel alive.
            </p>

            <p className="mt-8 text-gray-500">
              Designed & Built by <span className="text-white">Alok Bhadauria</span>
            </p>

            <div className="w-full h-px bg-white/10 mt-6"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
