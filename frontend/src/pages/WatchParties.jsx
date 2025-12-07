import { useEffect, useState } from "react";
import { getPublicParties } from "../api/partyAPI";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function WatchParties() {
  const navigate = useNavigate();

  const [parties, setParties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchParties = async () => {
    try {
      const res = await getPublicParties();
      const list = res.data.parties || [];
      setParties(list);
      setFiltered(list);
    } catch {
      toast.error("Failed to fetch parties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const doSearch = () => {
    if (!searchCode.trim()) return setFiltered(parties);
    setFiltered(parties.filter((p) => p.code.toLowerCase().includes(searchCode.toLowerCase())));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000] via-[#0a0f1f] to-[#1b0f2f] text-white px-6 pt-28 pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-300">Active Watch Parties</h1>

        <button
          onClick={() => navigate("/parties/create")}
          className="px-6 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition"
        >
          + Create Party
        </button>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <input
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Search by party code"
          className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white"
        />
        <button
          onClick={doSearch}
          className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-gray-300 text-center">Loading parties...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center text-lg mt-6">No parties found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="p-6 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 backdrop-blur-xl shadow-lg flex flex-col gap-3"
            >
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold text-cyan-300">{p.name}</h2>
                {p.isPrivate && <i className="ri-lock-fill text-purple-300 text-xl"></i>}
              </div>

              <p className="text-gray-300 text-sm">{p.description || "No description"}</p>

              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>
                  <i className="ri-user-line mr-1"></i>
                  Host: {p.host?.username}
                </span>
                <span>
                  <i className="ri-group-line mr-1"></i>
                  {p.participantsCount} joined
                </span>
              </div>

              <button
                onClick={() => navigate("/parties/join", { state: { party: p } })}
                className="mt-3 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30 transition"
              >
                Join Party
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
