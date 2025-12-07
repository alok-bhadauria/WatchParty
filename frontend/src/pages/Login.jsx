import { useState, useContext } from "react";
import { loginUser } from "../api/authAPI";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({ identifier, password });
      login(res.data.user, res.data.token);
      toast.success("Welcome back!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br from-[#000000] via-[#0a0f1f] to-[#1b0f2f]
      text-white pt-16 px-4
    "
    >
      <div
        className="
        w-full max-w-md p-8 rounded-2xl
        bg-white/10 border border-white/20 backdrop-blur-xl
        shadow-[0_0_40px_rgba(0,255,255,0.2)]
      "
      >
        <h2 className="text-3xl font-semibold text-cyan-300 text-center">
          Login
        </h2>

        <form onSubmit={submitLogin} className="flex flex-col gap-4 mt-6">
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="
              p-3 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400 w-full
            "
            required
          />

          <div className="relative w-full">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                p-3 rounded-xl bg-white/10 border border-white/20
                text-white placeholder-gray-400 w-full
              "
              required
            />

            <i
              onClick={() => setShowPass(!showPass)}
              className={`
                absolute right-4 top-3 text-xl cursor-pointer 
                ${showPass ? "ri-eye-off-line" : "ri-eye-line"}
              `}
            ></i>
          </div>

          <button
            className="
            mt-2 py-3 rounded-xl
            bg-cyan-500/20 border border-cyan-500/40
            text-cyan-300 font-semibold
            backdrop-blur-xl hover:bg-cyan-500/30 transition
            shadow-[0_0_25px_rgba(0,255,255,0.25)]
          "
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300">
          Don't have an account?
          <a href="/register" className="text-purple-400 hover:underline ml-1">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
