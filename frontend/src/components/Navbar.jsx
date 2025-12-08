import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ===============================
  // 🔥 SERVER STATUS SYSTEM
  // ===============================
  const [status, setStatus] = useState("Checking...");

  const checkServer = async () => {
    setStatus("Connecting...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL.replace("/api", "")}`);
      if (res.ok) setStatus("Online");
      else setStatus("Offline");
    } catch {
      setStatus("Offline");
    }
  };

  useEffect(() => {
    checkServer(); // auto-check on load
  }, []);

  return (
    <nav
      className="
      fixed top-0 left-0 w-full z-50 px-6 py-2
      bg-white/10 backdrop-blur-xl border-b border-white/20
      flex items-center justify-between
    "
    >
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-extrabold tracking-wide 
        text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
      >
        WatchParty
      </Link>

      {/* Desktop menu */}
      <div className="hidden md:flex items-center gap-6">

        <Link
          to="/parties"
          className="
            px-4 py-2 rounded-xl 
            bg-cyan-500/10 border border-cyan-500/40
            text-cyan-300 hover:bg-cyan-500/20 transition
            shadow-[0_0_10px_rgba(0,255,255,0.25)]
          "
        >
          Parties
        </Link>

        {user ? (
          <>
            <Link
              to="/profile"
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                bg-purple-500/10 border border-purple-500/40
                text-purple-300 hover:bg-purple-500/20 transition
                shadow-[0_0_10px_rgba(180,0,255,0.25)]
              "
            >
              <i className="ri-user-3-line text-xl"></i>
              {user.username}
            </Link>

            <Link
              to="/feedback"
              className="
                px-4 py-2 rounded-xl
                bg-emerald-500/10 border border-emerald-500/40
                text-emerald-300 hover:bg-emerald-500/20 transition
                shadow-[0_0_10px_rgba(0,255,127,0.25)]
              "
            >
              Feedback
            </Link>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="
                px-4 py-2 rounded-xl
                bg-red-500/10 border border-red-500/40
                text-red-300 hover:bg-red-500/20 transition
                shadow-[0_0_10px_rgba(255,0,0,0.25)]
              "
            >
              Logout
            </button>

            <button
              onClick={checkServer}
              className={`
                px-4 py-2 rounded-xl border transition
                shadow-[0_0_10px_rgba(0,255,0,0.25)]
                ${
                  status === "Online"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : status === "Connecting..."
                    ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                    : "bg-red-500/10 border-red-500/40 text-red-300"
                }
              `}
            >
          Server : {status}
        </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="
                px-4 py-2 rounded-xl
                bg-cyan-500/10 border border-cyan-500/40
                text-cyan-300 hover:bg-cyan-500/20 transition
              "
            >
              Login
            </Link>

            <Link
              to="/register"
              className="
                px-4 py-2 rounded-xl
                bg-purple-500/10 border border-purple-500/40
                text-purple-300 hover:bg-purple-500/20 transition
              "
            >
              Register
            </Link>

            <button
          onClick={checkServer}
          className={`
            px-4 py-2 rounded-xl border transition
            shadow-[0_0_10px_rgba(0,255,0,0.25)]
            ${
              status === "Online"
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : status === "Connecting..."
                ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                : "bg-red-500/10 border-red-500/40 text-red-300"
            }
          `}
        >
          Server : {status}
        </button>
          </>
        )}
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden text-3xl text-white"
        onClick={() => setOpen(!open)}
      >
        <i className={open ? "ri-close-line" : "ri-menu-line"}></i>
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="
          absolute top-14 left-0 w-full px-6 py-4
          bg-[#0a0f1f]/95 backdrop-blur-xl border-t border-white/10
          flex flex-col gap-4 md:hidden
        "
        >
          <Link
            to="/parties"
            onClick={() => setOpen(false)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-cyan-300 text-left"
          >
            Parties
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-purple-300 text-left"
              >
                <i className="ri-user-3-line mr-2"></i>
                {user.username}
              </Link>

              <Link
                to="/feedback"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-emerald-300 text-left"
              >
                Feedback
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-red-300 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-cyan-300 text-left"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-purple-300 text-left"
              >
                Register
              </Link>
              
            </>
          )}

          {/* SERVER STATUS - MOBILE */}
          <button
            onClick={checkServer}
            className={`
              px-3 py-2 rounded-lg border text-left
              ${
                status === "Online"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : status === "Connecting..."
                  ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                  : "bg-red-500/10 border-red-500/40 text-red-300"
              }
            `}
          >
            Server Status : {status}
          </button>

        </div>
      )}
    </nav>
  );
}
