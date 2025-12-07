import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { verifyPartyPassword } from "../api/partyAPI";
import { joinParticipant } from "../api/participantAPI";
import { updateUser } from "../api/authAPI";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function JoinParty() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token, login } = useContext(AuthContext);

  const party = state?.party;

  const [displayName, setDisplayName] = useState(user?.watchName || user?.username || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!party) return <NotFound />;

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔐 verify password
      if (party.isPrivate) {
        const res = await verifyPartyPassword({
          code: party.code,
          password,
        });
        if (!res.data.ok) throw new Error("Invalid password");
      }

      // 🔄 update user's display name in profile
      const userUpdate = await updateUser(user.id, { watchName: displayName });
      login(userUpdate.data.user, token);

      // 👤 join as participant (creates or reuses participant)
      const joinRes = await joinParticipant({
        partyId: party._id,
        displayName,
      });

      // 💾 Save active party info for auto-rejoin
      localStorage.setItem(
        "activeParty",
        JSON.stringify({
          partyId: party._id,
          participantId: joinRes.data.participant._id,
          displayName,
        })
      );

      toast.success("Joined party!");
      navigate("/party/" + party._id, {
        state: {
          party,
          participant: joinRes.data.participant,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000] via-[#0a0f1f] to-[#1b0f2f] text-white px-4 pt-28">
      <form
        onSubmit={handleJoin}
        className="w-full max-w-md p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-cyan-300 text-center">Join Party</h2>

        <p className="text-gray-300 text-center">
          <span className="text-purple-300">{party.name}</span>
          <br />
          <small className="text-gray-400">Code: {party.code}</small>
        </p>

        <span className="text-gray-300 text-center">ENTER DISPLAY NAME </span>
        <input
          type="text"
          placeholder="Enter display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="p-3 rounded-xl bg-white/10 border border-white/20 text-white"
        />

        {party.isPrivate && (
          <input
            type="password"
            placeholder="Room password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition"
        >
          {loading ? "Joining..." : "Join Party"}
        </button>
      </form>
    </div>
  );
}

function NotFound() {
  return <div className="text-white text-center mt-40 text-xl">No party selected.</div>;
}
