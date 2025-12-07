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
import { leaveParticipant } from "../api/participantAPI";

export default function PartyRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const socket = useContext(SocketContext);

  const party = state?.party;
  const participant = state?.participant;

  const [participants, setParticipants] = useState([]);
  const [view, setView] = useState("video"); // "video" | "whiteboard"
  const [mobilePanel, setMobilePanel] = useState("chat"); // "av" | "chat" | "participants"

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

  // JOIN ROOM + LISTEN
  useEffect(() => {
    if (!party || !participant) {
      navigate("/parties");
      return;
    }

    if (!socket) return;

    socket.emit("join-room", {
      partyId: party._id,
      participantId: participant._id,
      displayName: participant.displayName,
    });

    const handleParticipants = (list) => {
      setParticipants(list || []);
    };

    socket.on("participants-update", handleParticipants);

    return () => {
      socket.emit("leave-room", {
        partyId: party._id,
        participantId: participant._id,
      });

      leaveParticipant(participant._id).catch(() => {});

      socket.off("participants-update", handleParticipants);
    };
  }, [socket, party, participant, navigate]);

  const leaveRoom = async () => {
    try {
      await leaveParticipant(participant._id);
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

  if (!party || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#000] via-[#0a0f1f] to-[#1b0f2f]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white bg-gradient-to-br from-[#000] via-[#0a0f1f] to-[#1b0f2f] pt-15">
      {/* ====================== DESKTOP LAYOUT (NEW GRID) ====================== */}
      {!isMobile && (
        // OUTER WRAPPER: fixed height relative to viewport, like WindowPanel
        <div className="hidden md:block flex-1 min-h-0 px-4 pb-4 pt-3">
          <div
            className="
              h-[calc(100vh-5rem)]  /* adjust this if you want more/less space under navbar */
              min-h-0
              grid gap-4
              grid-cols-[2fr_1fr]   /* Left 2/3, Right 1/3 */
              grid-rows-[1.2fr_0.8fr]   /* Top and Bottom equal height */
            "
          >
            {/* LT — MEDIA (Row 1, Col 1) */}
            <div className="rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl flex flex-col overflow-hidden">
              {/* Media Area */}
              <div className="flex-1 min-h-0 relative overflow-hidden pb-10">
                {view === "video" ? (
                  <VideoPlayer party={party} participant={participant} />
                ) : (
                  <Whiteboard partyId={party._id} />
                )}
              </div>

              {/* Video / Whiteboard / Code buttons */}
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
                  <span className="font-mono text-xs sm:text-sm">
                    {party.code}
                  </span>
                </button>
              </div>
            </div>

            {/* RT — CHAT (Row 1, Col 2) */}
            <div className="rounded-2xl flex flex-col overflow-hidden bg-white/5 border border-white/15 backdrop-blur-xl min-h-0">
              <ChatBox
                partyId={party._id}
                participant={participant}
                partyName={party.name}
              />
            </div>

            {/* LB — AV PANEL (Row 2, Col 1) */}
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/15 backdrop-blur-xl min-h-0">
              <AVPanel
                partyId={party._id}
                participants={participants}
                onLeave={leaveRoom}
                showLeaveButton={!isMobile}
              />
            </div>

            {/* RB — PARTICIPANTS (Row 2, Col 2) */}
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/15 backdrop-blur-xl min-h-0">
              <ParticipantList participants={participants} />
            </div>
          </div>
        </div>
      )}

      {/* ====================== MOBILE LAYOUT (UNCHANGED) ====================== */}
      {isMobile && (
        <>
          {/* MAIN MEDIA PANEL ON MOBILE */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 pb-2">
              {view === "video" ? (
                <VideoPlayer party={party} participant={participant} />
              ) : (
                <Whiteboard partyId={party._id} />
              )}
            </div>

            {/* VIEW SWITCH + PARTY CODE */}
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

          {/* MOBILE WINDOW PANEL (AV / CHAT / PARTICIPANTS) */}
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
                  participant={participant}
                  partyName={party.name}
                  compact
                />
              ) : mobilePanel === "participants" ? (
                <ParticipantList participants={participants} compact />
              ) : null
            }
          />

          {/* MOBILE TOOLBAR (with existing round leave button etc.) */}
          <MobileToolbar
            participantsCount={participants.length}
            onSelect={(key) => setMobilePanel(key)}
          />
        </>
      )}
    </div>
  );
}
