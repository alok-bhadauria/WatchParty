// src/components/VideoPlayer.jsx
import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import { getMediaState, updateMediaState } from "../api/mediaAPI";
import toast from "react-hot-toast";

export default function VideoPlayer({ party, participant }) {
  const socket = useContext(SocketContext);
  const videoRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  const [mediaType, setMediaType] = useState("video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  const [loading, setLoading] = useState(true);

  const isHost = !!participant?.isHost;

  const detectMediaType = (url) => {
    if (!url) return "video";
    const lower = url.toLowerCase();
    const direct =
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg") ||
      lower.includes(".m3u8");

    return direct ? "video" : "unsupported";
  };

  // Load saved media state
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await getMediaState(party._id);
        const s = res.data?.state;
        if (!s || cancelled) return setLoading(false);

        setVideoUrl(s.videoUrl || "");
        setInputUrl(s.videoUrl || "");
        setMediaType(detectMediaType(s.videoUrl));
        setIsPlaying(!!s.isPlaying);
        setCurrentTime(s.currentTime || 0);
        setPlaybackRate(s.playbackRate || 1);
        if (s.volume !== undefined) setVolume(s.volume);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => (cancelled = true);
  }, [party._id]);

  // Listen for socket sync updates
  useEffect(() => {
    if (!socket) return;

    const handler = (state) => {
      if (!state || state.partyId !== party._id) return;

      setVideoUrl(state.videoUrl);
      setMediaType(detectMediaType(state.videoUrl));
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setPlaybackRate(state.playbackRate);
      if (state.volume !== undefined) setVolume(state.volume);

      const v = videoRef.current;
      if (!v) return;

      if (Math.abs(v.currentTime - state.currentTime) > 0.5) {
        v.currentTime = state.currentTime;
      }
      v.playbackRate = state.playbackRate;

      if (state.isPlaying) v.play().catch(() => {});
      else v.pause();
    };

    socket.on("media:update", handler);
    return () => socket.off("media:update", handler);
  }, [socket, party._id]);

  const sync = async (next) => {
    const s = {
      partyId: party._id,
      videoUrl: next.videoUrl ?? videoUrl,
      currentTime: next.currentTime ?? currentTime,
      isPlaying: next.isPlaying ?? isPlaying,
      playbackRate: next.playbackRate ?? playbackRate,
      volume: next.volume ?? volume,
    };

    try {
      await updateMediaState(s);
      socket.emit("media:sync", { partyId: party._id, state: s });
    } catch {}
  };

  const loadMedia = async () => {
    if (!inputUrl.trim()) return toast.error("Please enter a URL");

    const type = detectMediaType(inputUrl.trim());
    if (type === "unsupported") {
      toast.error("Only direct video URLs (.mp4, .webm) are supported");
    }

    setVideoUrl(inputUrl.trim());
    setMediaType(type);
    setIsPlaying(false);
    setCurrentTime(0);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    await sync({
      videoUrl: inputUrl.trim(),
      currentTime: 0,
      isPlaying: false,
    });

    toast.success("Loaded for everyone");
  };

  const handlePlay = async () => {
    if (!isHost) return;
    setIsPlaying(true);
    await sync({
      isPlaying: true,
      currentTime: videoRef.current?.currentTime,
    });
  };

  const handlePause = async () => {
    if (!isHost) return;
    setIsPlaying(false);
    await sync({
      isPlaying: false,
      currentTime: videoRef.current?.currentTime,
    });
  };

  const handleSeek = async () => {
    if (!isHost || !videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    await sync({ currentTime: t });
  };

  const handleLoaded = () => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
    videoRef.current.volume = volume;
  };

  const handleRate = async (rate) => {
    if (!isHost) return;
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    await sync({ playbackRate: rate });
  };

  const handleVol = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300">
        Loading video…
      </div>
    );

  const unsupported = videoUrl && mediaType === "unsupported";

  return (
    <div className="flex flex-col w-full items-center px-4 pt-4">

      {/* ================= URL INPUT (Host Only) ================ */}
      {isHost && (
        <div className="w-full max-w-3xl flex gap-2 mb-3">
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste direct video URL (.mp4)"
            className="
              flex-1 p-2 rounded-xl bg-white/10 border border-white/20
              text-white placeholder-gray-400 text-sm
            "
          />
          <button
            onClick={loadMedia}
            className="
              px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40
              text-cyan-300 hover:bg-cyan-500/30 text-sm
            "
          >
            Load
          </button>
        </div>
      )}

      {/* =================== PLAYER AREA ===================== */}
      <div
        className="
          w-full max-w-3xl aspect-video rounded-xl
          bg-white/10 border border-white/20
          flex items-center justify-center text-gray-300 overflow-hidden
        "
      >
        {!videoUrl ? (
          <p className="text-sm text-gray-400">
            {isHost
              ? "Paste a video URL above to start the party"
              : "Waiting for the host to load a video…"}
          </p>
        ) : unsupported ? (
          <div className="p-4 text-center text-sm">
            <p className="mb-1">Unsupported link</p>
            <p className="text-gray-400">Use a direct video URL (.mp4)</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain bg-black"
            controls={isHost}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeek}
            onLoadedMetadata={handleLoaded}
          />
        )}
      </div>

      {/* ================== CONTROL ROW ===================== */}
      <div className="flex items-center justify-between w-full max-w-3xl mt-3 text-sm pb-3">

        <span className="text-gray-400">
          {isHost ? "You control playback" : "Synced viewer"}
        </span>

        <div className="flex items-center gap-3">

          {/* Playback speed */}
          {isHost && (
            <select
              value={playbackRate}
              onChange={(e) => handleRate(Number(e.target.value))}
              className="
                bg-white/10 text-white text-xs rounded-lg px-2 py-1
                border border-white/20 focus:ring-2 focus:ring-cyan-400
              "
            >
              {[0.5, 1, 1.25, 1.5, 2].map((r) => (
                <option key={r} value={r} className="bg-[#0a0f1f] text-white">
                  {r}x
                </option>
              ))}
            </select>
          )}

          {/* Volume */}
          <div className="flex items-center gap-2">
            <i className="ri-volume-up-line text-lg" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVol}
              className="w-24"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
