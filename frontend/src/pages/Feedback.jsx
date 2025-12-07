import { useState, useEffect } from "react";
import { createFeedback, getFeedback } from "../api/feedbackAPI";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [items, setItems] = useState([]);

  const loadFeedback = async () => {
    try {
      const res = await getFeedback();
      setItems(res.data.feedbacks || []);
    } catch {}
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Please write something");

    try {
      await createFeedback({ message, rating });
      toast.success("Thanks for your feedback!");
      setMessage("");
      setRating(5);
      loadFeedback();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000] via-[#0a0f1f] to-[#1b0f2f] text-white px-6 pt-28 pb-12 flex justify-center">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-[0_0_35px_rgba(0,255,255,0.25)] flex flex-col gap-6">
        
        <h1 className="text-3xl font-bold text-cyan-300 text-center">
          Feedback & Ideas
        </h1>
        <p className="text-gray-300 text-sm text-center">
          Share bugs, ideas, feature requests, or love letters to your own project. 💌
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What would you like to share?"
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 h-28"
          />

          {/* Rating select with proper dark theme */}
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm">Rating:</span>

            <div className="relative">
              <select
                name="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="
                  p-3 pr-10 rounded-xl bg-white/10 border border-white/20 
                  text-white appearance-none
                  focus:ring-2 focus:ring-cyan-400
                  hover:bg-white/20 transition
                "
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option
                    key={r}
                    value={r}
                    style={{
                      backgroundColor: "#0a0f1f",
                      color: "white",
                    }}
                  >
                    {r} / 5
                  </option>
                ))}
              </select>

              {/* Custom neon dropdown arrow */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-300 text-sm">
                ▼
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition shadow-[0_0_25px_rgba(0,255,255,0.25)]"
          >
            Submit Feedback
          </button>
        </form>

        {items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-purple-300 mb-2">
              Recent Feedback
            </h2>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {items.map((f) => (
                <div
                  key={f._id}
                  className="p-3 rounded-xl bg-white/10 border border-white/20"
                >
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{new Date(f.createdAt).toLocaleString()}</span>
                    <span>⭐ {f.rating}</span>
                  </div>
                  <p className="text-gray-100 text-sm">{f.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
