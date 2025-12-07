import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import toast from "react-hot-toast";

/**
 * AVPanel:
 * - Simple 1:1 WebRTC for now (good when 2 users in room)
 * - Picks the first other participant as remote peer
 */
export default function AVPanel({ partyId, participants, onLeave, showLeaveButton = false }) {
  const socket = useContext(SocketContext);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  // Create RTCPeerConnection
  const createPeerConnection = () => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && remoteSocketIdRef.current) {
        socket.emit("webrtc:ice-candidate", {
          partyId,
          to: remoteSocketIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (!remoteVideoRef.current) return;
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
      remoteStreamRef.current.addTrack(event.track);
    };

    pcRef.current = pc;
    return pc;
  };

  // Pick a remote peer (first other participant)
  const getRemoteSocketId = () => {
    const me = socket?.id;
    if (!me) return null;

    const others = (participants || []).filter((p) => p.socketId !== me);
    return others.length ? others[0].socketId : null;
  };

  // WebRTC signaling listeners
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ from, offer }) => {
      remoteSocketIdRef.current = from;
      const pc = createPeerConnection();

      if (!localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          stream.getTracks().forEach((t) => pc.addTrack(t, stream));
          setCamOn(true);
        } catch (err) {
          toast.error("Could not access camera/mic");
          return;
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc:answer", { partyId, to: from, answer });
    };

    const handleAnswer = async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    };

    const handleCandidate = async ({ candidate }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE error", err);
      }
    };

    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleCandidate);

    return () => {
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleCandidate);
    };
  }, [socket, participants, partyId]);

  // Start camera and initiate call
  const startCamera = async () => {
    const remoteId = getRemoteSocketId();
    if (!remoteId) return toast("Waiting for another user...");

    remoteSocketIdRef.current = remoteId;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc:offer", { partyId, to: remoteId, offer });

      setCamOn(true);
      setMicOn(true);
    } catch (err) {
      toast.error("Unable to access camera/mic");
    }
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const tracks = localStreamRef.current.getAudioTracks();
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setMicOn((m) => !m);
  };

  const shareScreen = async () => {
    if (!pcRef.current) return toast("Start camera first");

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = pcRef.current
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) await sender.replaceTrack(screenTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      setScreenOn(true);

      screenTrack.onended = async () => {
        if (localStreamRef.current) {
          const camTrack = localStreamRef.current.getVideoTracks()[0];
          if (sender && camTrack) {
            await sender.replaceTrack(camTrack);
          }
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        }
        setScreenOn(false);
      };
    } catch (err) {
      toast.error("Screen share failed");
    }
  };

  const endCall = () => {
    if (pcRef.current) pcRef.current.close();
    pcRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    localStreamRef.current = null;

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    remoteStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCamOn(false);
    setMicOn(true);
    setScreenOn(false);
  };

  const handleLeaveClick = () => {
    endCall();
    onLeave && onLeave();
  };

  return (
    <div
      className="
        h-full w-full rounded-2xl
        bg-white/5 border border-white/15 backdrop-blur-xl
        flex flex-col
      "
    >
      {/* TITLE BAR */}
      <div
        className="
          flex items-center justify-between
          px-4 py-2 border-b border-white/10 bg-white/10
        "
      >
        <div className="flex items-center gap-2">
          <i className="ri-mic-line text-purple-300" />
          <span className="text-sm font-semibold text-purple-200">
            Live AV
          </span>
        </div>
      </div>
  

      {/* CONTENT */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 p-4">
        {/* Video boxes: side-by-side even on mobile */}
        <div className="flex flex-row gap-4 flex-1 min-h-0">
          {/* Self */}
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-xs text-gray-300 mb-1">You</span>
            <div
              className="
                rounded-xl border border-white/20 bg-black/60
                overflow-hidden flex-1
              "
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Remote */}
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-xs text-gray-300 mb-1">Remote</span>
            <div
              className="
                rounded-xl border border-white/20 bg-black/60
                overflow-hidden flex-1
              "
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Controls: 2×2 grid on mobile, row-ish on larger screens */}
        <div
          className="
            mt-2 grid grid-cols-2 gap-3
            sm:grid-cols-2
            md:flex md:flex-wrap
          "
        >
          <button
            onClick={startCamera}
            className="
              px-3 py-2 rounded-xl
              bg-cyan-500/20 border border-cyan-500/40
              text-cyan-300 hover:bg-cyan-500/30 transition
              flex items-center justify-center gap-2 text-xs sm:text-sm
            "
          >
            <i className="ri-video-add-line" />
            <span>{camOn ? "Restart Cam" : "Start Cam & Call"}</span>
          </button>

          <button
            onClick={toggleMic}
            disabled={!camOn}
            className={`
              px-3 py-2 rounded-xl border
              flex items-center justify-center gap-2 text-xs sm:text-sm
              ${
                micOn
                  ? "bg-white/10 border-white/30 text-gray-100"
                  : "bg-red-500/20 border-red-500/50 text-red-200"
              }
            `}
          >
            <i className={micOn ? "ri-mic-line" : "ri-mic-off-line"} />
            <span>{micOn ? "Mute Mic" : "Unmute Mic"}</span>
          </button>

          <button
            onClick={shareScreen}
            disabled={!camOn}
            className={`
              px-3 py-2 rounded-xl border
              flex items-center justify-center gap-2 text-xs sm:text-sm
              ${
                screenOn
                  ? "bg-purple-500/30 border-purple-500/60 text-purple-100"
                  : "bg-purple-500/20 border-purple-500/40 text-purple-200"
              }
            `}
          >
            <i className="ri-computer-line" />
            <span>{screenOn ? "Sharing..." : "Share Screen"}</span>
          </button>

          <button
            onClick={endCall}
            className="
              px-3 py-2 rounded-xl
              bg-red-500/20 border border-red-500/40
              text-red-200 hover:bg-red-500/30 transition
              flex items-center justify-center gap-2 text-xs sm:text-sm
            "
          >
            <i className="ri-phone-hangup-line" />
            <span>End Call</span>
          </button>

          {showLeaveButton && (
            <button
              onClick={onLeave}
              className="
                px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40
                text-red-300 hover:bg-red-500/30 text-sm flex items-center gap-1
              "
            >
              <i className="ri-logout-box-r-line" />
              <span>Leave Party</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
