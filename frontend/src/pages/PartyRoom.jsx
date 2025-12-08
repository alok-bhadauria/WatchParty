import { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

import VideoPlayer from "../components/VideoPlayer";
import Whiteboard from "../components/Whiteboard";
import AVPanel from "../components/AVPanel";
import ChatBox from "../components/ChatBox";
import ParticipantList from "../components/ParticipantList";

import WindowPanel from "../components/WindowPanel";
import MobileToolbar from "../components/MobileToolbar";

import toast from "react-hot-toast";
import { joinParticipant, leaveParticipant } from "../api/participantAPI";

export default function PartyRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const socket = useContext(SocketContext);

  const party = state?.party;
  const participant = state?.participant;

  const [dbParticipant, setDbParticipant] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [view, setView] = useState("video");
  const [mobilePanel, setMobilePanel] = useState("chat");

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

  // Join backend participant record
  useEffect(() => {
    if (!party || !participant) {
      navigate("/parties");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await joinParticipant({
          partyId: party._id,
          displayName: participant.displayName || "Guest",
          avatar: participant.avatar || "",
          isAnonymous: participant.isAnonymous ?? true,
        });

        if (!cancelled) setDbParticipant(res.data.participant);
      } catch (err) {
        toast.error("Could not join party");
        navigate("/parties");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [party, participant, navigate]);

  // Socket join
  useEffect(() => {
    if (!party || !dbParticipant || !socket) return;

    socket.emit("join-room", {
      partyId: party._id,
      participantId: dbParticipant._id,
      displayName: dbParticipant.displayName,
    });

    const handleParticipants = (list) => {
      setParticipants(list || []);
    };

    socket.on("participants-update", handleParticipants);

    return () => {
      socket.emit("leave-room", {
        partyId: party._id,
        participantId: dbParticipant._id,
      });

      leaveParticipant(dbParticipant._id).catch(() => {});
      socket.off("participants-update", handleParticipants);
    };
  }, [socket, party, dbParticipant]);

  const leaveRoom = async () => {
    try {
      if (dbParticipant?._id) await leaveParticipant(dbParticipant._id);
    } catch {}
    toast("You left the party");
    navigate("/parties");
  };

  const copyPartyCode = async () => {
    try {
      await navigator.clipboard.writeText(party.code);
      toast.success("Room code copied");
    } catch {
      toast.error("Could not copy code");
    }
  };

  if (!party || !dbParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#000] via-[#0a0f1f] to-[#1b0f2f]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white bg-gradient-to-br from-[#000] via-[#0a0f1f] to-[#1b0f2f] pt-15">
      
      {/* ======================== DESKTOP (SCROLLABLE LAYOUT) ======================== */}
      {!isMobile && (
        <div className="hidden md:block flex-1 px-4 pb-4 pt-3 overflow-y-auto">
          <div
            className="
              grid gap-4
              grid-cols-[2fr_1fr]
              auto-rows-max
            "
          >
            {/* ================= LEFT TOP — MEDIA ================= */}
            <div className="rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl flex flex-col min-h-fit overflow-hidden">
              
              <div className="flex-1 min-h-fit relative overflow-hidden pb-10">
                {view === "video" ? (
                  <VideoPlayer party={party} participant={dbParticipant} />
                ) : (
                  <Whiteboard partyId={party._id} />
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center items-center px-4 py-2 border-t border-white/10 bg-white/10">
                <button
                  onClick={() => setView("video")}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm ${
                    view === "video"
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                      : "border-white/20 bg-white/5 text-gray-300"
                  }`}
                >
                  <i className="ri-movie-2-line" />
                  <span>Video</span>
                </button>

                <button
                  onClick={() => setView("whiteboard")}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm ${
                    view === "whiteboard"
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-white/20 bg-white/5 text-gray-300"
                  }`}
                >
                  <i className="ri-pencil-ruler-2-line" />
                  <span>Whiteboard</span>
                </button>

                <button
                  onClick={copyPartyCode}
                  className="
                    px-4 py-2 rounded-xl border flex items-center gap-2 text-sm
                    border-emerald-500/40 bg-emerald-500/10 text-emerald-200
                    hover:bg-emerald-500/20 transition
                  "
                >
                  <i className="ri-key-2-line" />
                  <span className="hidden sm:inline">Room Code:</span>
                  <span className="font-mono text-xs sm:text-sm">{party.code}</span>
                </button>
              </div>
            </div>

            {/* ================= RIGHT TOP — CHAT ================= */}
            <div className="rounded-2xl flex flex-col overflow-hidden bg-white/5 border border-white/15 backdrop-blur-xl min-h-fit">
              <ChatBox
                partyId={party._id}
                participant={dbParticipant}
                partyName={party.name}
              />
            </div>

            {/* ================= LEFT BOTTOM — AV PANEL ================= */}
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/15 backdrop-blur-xl min-h-fit">
              <div className="min-h-[200px]">
                <AVPanel
                  partyId={party._id}
                  participants={participants}
                  onLeave={leaveRoom}
                  showLeaveButton={!isMobile}
                />
              </div>
            </div>

            {/* ================= RIGHT BOTTOM — PARTICIPANTS ================= */}
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/15 backdrop-blur-xl min-h-fit">
              <ParticipantList participants={participants} />
            </div>
          </div>
        </div>
      )}

      {/* ======================== MOBILE (UNTOUCHED) ======================== */}
      {isMobile && (
        <>
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 pb-2">
              {view === "video" ? (
                <VideoPlayer party={party} participant={dbParticipant} />
              ) : (
                <Whiteboard partyId={party._id} />
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-center items-center px-3 py-2 border-t border-white/10 bg-white/10">
              <button
                onClick={() => setView("video")}
                className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs ${
                  view === "video"
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                    : "border-white/20 bg-white/5 text-gray-300"
                }`}
              >
                <i className="ri-movie-2-line" />
                <span>Video</span>
              </button>

              <button
                onClick={() => setView("whiteboard")}
                className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs ${
                  view === "whiteboard"
                    ? "border-purple-500 bg-purple-500/20 text-purple-300"
                    : "border-white/20 bg-white/5 text-gray-300"
                }`}
              >
                <i className="ri-pencil-ruler-2-line" />
                <span>Whiteboard</span>
              </button>

              <button
                onClick={copyPartyCode}
                className="
                  px-3 py-2 rounded-xl border flex items-center gap-2 text-[11px]
                  border-emerald-500/40 bg-emerald-500/10 text-emerald-200
                  hover:bg-emerald-500/20 transition
                "
              >
                <i className="ri-key-2-line" />
                <span>Code:</span>
                <span className="font-mono">{party.code}</span>
              </button>
            </div>
          </div>

          <WindowPanel
            open={!!mobilePanel}
            onClose={() => setMobilePanel(null)}
            content={
              mobilePanel === "av" ? (
                <AVPanel
                  partyId={party._id}
                  participants={participants}
                  onLeave={leaveRoom}
                />
              ) : mobilePanel === "chat" ? (
                <ChatBox
                  partyId={party._id}
                  participant={dbParticipant}
                  partyName={party.name}
                  compact
                />
              ) : mobilePanel === "participants" ? (
                <ParticipantList participants={participants} compact />
              ) : null
            }
          />

          <MobileToolbar
            participantsCount={participants.length}
            onSelect={(key) => setMobilePanel(key)}
          />
        </>
      )}
    </div>
  );
}
