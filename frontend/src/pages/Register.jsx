import { useState, useContext } from "react";
import { registerUser } from "../api/authAPI";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    watchName: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitRegister = async (e) => {
    e.preventDefault();

    // ❗ Password match check
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { confirmPassword, ...payload } = form;
      const res = await registerUser(payload);

      login(res.data.user, res.data.token);
      toast.success("Account created!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
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
          Create Account
        </h2>

        <form onSubmit={submitRegister} className="flex flex-col gap-4 mt-6">
          {/* Name */}
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="
              p-3 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400
            "
            required
          />

          {/* Username */}
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="
              p-3 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400
            "
            required
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="
              p-3 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400
            "
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
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

          {/* Confirm Password */}
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="
                p-3 rounded-xl bg-white/10 border border-white/20
                text-white placeholder-gray-400 w-full
              "
              required
            />

            <i
              onClick={() => setShowConfirm(!showConfirm)}
              className={`
                absolute right-4 top-3 text-xl cursor-pointer 
                ${showConfirm ? "ri-eye-off-line" : "ri-eye-line"}
              `}
            ></i>
          </div>

          {/* WatchName */}
          <input
            name="watchName"
            type="text"
            placeholder="Display Name (optional)"
            value={form.watchName}
            onChange={handleChange}
            className="
              p-3 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400
            "
          />

          {/* Submit */}
          <button
            className="
              mt-2 py-3 rounded-xl
              bg-cyan-500/20 border border-cyan-500/40
              text-cyan-300 font-semibold
              backdrop-blur-xl hover:bg-cyan-500/30 transition
              shadow-[0_0_25px_rgba(0,255,255,0.25)]
            "
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300">
          Already have an account?
          <a href="/login" className="text-purple-400 hover:underline ml-1">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
