import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateUser } from "../api/authAPI";
import toast from "react-hot-toast";
import { AVATARS } from "../data/avatars";
import { changePassword as changePasswordAPI } from "../api/authAPI";

export default function Profile() {
  const { user, token, login } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    watchName: user?.watchName || "",
    avatar: user?.avatar || AVATARS[0],
  });

  const [passwords, setPasswords] = useState({
    oldPass: "",
    newPass: "",
    confirmNew: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const selectAvatar = (url) => {
    setForm({ ...form, avatar: url });
  };

  const saveProfile = async () => {
    try {
      const res = await updateUser(user.id, form);
      login(res.data.user, token);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirmNew)
      return toast.error("Passwords do not match");

    if (passwords.newPass.length < 6)
      return toast.error("New password must be at least 6 characters");

    try {
      await changePasswordAPI({
        oldPassword: passwords.oldPass,
        newPassword: passwords.newPass,
      });

      toast.success("Password updated successfully");

      setPasswords({
        oldPass: "",
        newPass: "",
        confirmNew: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div
      className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br from-[#000000] via-[#0a0f1f] to-[#1b0f2f]
      text-white px-4 pt-24
    "
    >
      <div
        className="
        w-full max-w-3xl p-8 rounded-2xl
        bg-white/10 border border-white/20 backdrop-blur-xl
        shadow-[0_0_40px_rgba(0,255,255,0.2)]
        flex flex-col gap-8
      "
      >
        <h2 className="text-3xl font-semibold text-cyan-300 text-center">
          Your Profile
        </h2>

        {/* Top section: Avatar + Basic info */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar & selection */}
          <div className="md:w-1/3 flex flex-col items-center gap-4">
            <img
              src={form.avatar || AVATARS[0]}
              className="w-28 h-28 rounded-full object-cover border border-white/30 shadow-lg"
            />
            <p className="text-sm text-gray-300">
              Choose an avatar from the list below
            </p>
          </div>

          {/* Basic info */}
          <div className="md:flex-1 flex flex-col gap-4">
            {["name", "username", "email", "watchName"].map((field) => (
              <input
                key={field}
                name={field}
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                placeholder={field}
                onChange={handleChange}
                className="
                  p-3 rounded-xl bg-white/10 border border-white/20
                  text-white placeholder-gray-400
                "
              />
            ))}

            <button
              onClick={saveProfile}
              className="
                py-3 rounded-xl w-full
                bg-cyan-500/20 border border-cyan-500/40
                text-cyan-300 font-semibold
                backdrop-blur-xl hover:bg-cyan-500/30 transition
                shadow-[0_0_25px_rgba(0,255,255,0.25)]
              "
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Avatar grid */}
        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-3">
            Choose an Avatar
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {AVATARS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => selectAvatar(url)}
                className={`
                  rounded-xl border p-1
                  ${form.avatar === url
                    ? "border-cyan-400 bg-cyan-500/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                  }
                `}
              >
                <img
                  src={url}
                  className="w-full h-full rounded-lg object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Change password section */}
        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-3">
            Change Password
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              name="oldPass"
              type="password"
              placeholder="Old password"
              value={passwords.oldPass}
              onChange={handlePasswordChange}
              className="
                flex-1 p-3 rounded-xl bg-white/10 border border-white/20
                text-white placeholder-gray-400
              "
            />
            <input
              name="newPass"
              type="password"
              placeholder="New password"
              value={passwords.newPass}
              onChange={handlePasswordChange}
              className="
                flex-1 p-3 rounded-xl bg-white/10 border border-white/20
                text-white placeholder-gray-400
              "
            />
            <input
              name="confirmNew"
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirmNew}
              onChange={handlePasswordChange}
              className="
                flex-1 p-3 rounded-xl bg-white/10 border border-white/20
                text-white placeholder-gray-400
              "
            />
          </div>

          <button
            onClick={changePassword}
            className="
              mt-3 py-3 rounded-xl w-full
              bg-purple-600/30 border border-purple-500/40
              text-purple-200 font-semibold
              hover:bg-purple-600/40 transition
              shadow-[0_0_25px_rgba(180,0,255,0.25)]
            "
          >
            Update Password
          </button>

        </div>
      </div>
    </div>
  );
}
