import { useState, useContext } from "react";
import { createParty } from "../api/partyAPI";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function CreateParty() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    isPrivate: false,
    password: "",
    maxParticipants: 50,
    settings: {
      enableChat: true,
      enableAudio: true,
      enableVideo: true,
      enableWhiteboard: true,
    },
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSetting = (key) => {
    setForm({
      ...form,
      settings: { ...form.settings, [key]: !form.settings[key] },
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Party name is required");
    if (form.isPrivate && form.password.trim().length < 4)
      return toast.error("Private party password must be at least 4 characters");

    try {
      const res = await createParty(form);

      toast.success("Party created!");
      navigate("/parties/join", { state: { party: res.data.party } });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create party");
    }
  };

  return (
    <div
      className="
      min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0f1f] to-[#1b0f2f]
      text-white px-6 pt-24 pb-12 flex justify-center
    "
    >
      <form
        onSubmit={submitForm}
        className="
        w-full max-w-xl p-8 rounded-2xl
        bg-white/10 border border-white/20 backdrop-blur-xl
        shadow-[0_0_35px_rgba(0,255,255,0.25)]
        flex flex-col gap-6
      "
      >
        <h1 className="text-3xl font-bold text-cyan-300 text-center">
          Create Watch Party
        </h1>

        {/* Party Name */}
        <input
          name="name"
          type="text"
          placeholder="Party name"
          value={form.name}
          onChange={handleChange}
          className="
            p-3 rounded-xl bg-white/10 border border-white/20
            text-white placeholder-gray-400
          "
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Short description (optional)"
          value={form.description}
          onChange={handleChange}
          className="
            p-3 rounded-xl bg-white/10 border border-white/20
            text-white placeholder-gray-400 h-28
          "
        ></textarea>

        {/* Public / Private toggle */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-300">Make room private?</span>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
              className="hidden"
            />
            <div
              className={`
              w-12 h-6 rounded-full transition bg-white/20 relative
              ${form.isPrivate ? "bg-purple-500/40" : ""}
            `}
            >
              <div
                className={`
                w-5 h-5 bg-white rounded-full absolute top-[2px] transition
                ${form.isPrivate ? "right-1" : "left-1"}
              `}
              ></div>
            </div>
          </label>
        </div>

        {/* Password Input */}
        {form.isPrivate && (
          <input
            name="password"
            type="password"
            placeholder="Room password"
            value={form.password}
            onChange={handleChange}
            className="
              p-3 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400
            "
          />
        )}

        {/* Max Participants */}
        <div className="flex items-center gap-3">
          <span className="text-gray-300">Max Participants : </span>
          <input
            name="maxParticipants"
            type="number"
            min="1"
            max="50"
            value={form.maxParticipants}
            onChange={handleChange}
            placeholder="Max (50)"
            className="
              w-28 p-3 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400
              appearance-none
            "
          />

          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                maxParticipants: Math.min(50, Number(form.maxParticipants) + 1),
              })
            }
            className="
              px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40
              text-cyan-300 font-bold hover:bg-cyan-500/30 transition
            "
          >
            ▲
          </button>

          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                maxParticipants: Math.max(1, Number(form.maxParticipants) - 1),
              })
            }
            className="
              px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40
              text-cyan-300 font-bold hover:bg-cyan-500/30 transition
            "
          >
            ▼
          </button>
        </div>

        {/* Settings */}
        <h3 className="text-xl text-purple-300 font-semibold mt-2">
          Room Settings
        </h3>

        {[
          ["enableChat", "Enable chat"],
          ["enableAudio", "Allow microphone"],
          ["enableVideo", "Allow camera"],
          ["enableWhiteboard", "Enable whiteboard"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-300">{label}</span>

            <input
              type="checkbox"
              checked={form.settings[key]}
              onChange={() => toggleSetting(key)}
              className="hidden"
            />

            <div
              className={`
                w-12 h-6 rounded-full transition bg-white/20 relative
                ${form.settings[key] ? "bg-cyan-500/40" : ""}
              `}
            >
              <div
                className={`
                  w-5 h-5 bg-white rounded-full absolute top-[2px] transition
                  ${form.settings[key] ? "right-1" : "left-1"}
                `}
              ></div>
            </div>
          </label>
        ))}

        <button
          type="submit"
          className="
            mt-4 py-3 rounded-xl
            bg-cyan-500/20 border border-cyan-500/40
            text-cyan-300 font-semibold
            hover:bg-cyan-500/30 transition
            shadow-[0_0_25px_rgba(0,255,255,0.25)]
          "
        >
          Create Party
        </button>
      </form>
    </div>
  );
}
