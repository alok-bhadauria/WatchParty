// backend/socket/socketServer.js
const Participant = require("../models/Participant");
const Party = require("../models/Party");

module.exports = function (io) {
  console.log("🔌 Socket.IO initialized");

  // In-memory tracking
  // rooms[partyId] = [{ socketId, participantId, displayName }]
  const rooms = {};

  // Whiteboard history
  // whiteboardStrokes[partyId] = [{ prevX, prevY, x, y }]
  const whiteboardStrokes = {};

  // Helper: bump party lastActive on any activity
  async function touchParty(partyId) {
    if (!partyId) return;
    try {
      await Party.findByIdAndUpdate(partyId, {
        $set: {
          lastActive: Date.now(),
          isActive: true,
        },
      });
    } catch (err) {
      console.error("Failed to update party lastActive:", err.message);
    }
  }

  // Helper: clean up DB when a participant disappears (disconnect case)
  async function cleanupParticipant(participantId) {
    try {
      const participant = await Participant.findById(participantId);
      if (!participant) return; // already removed via API /leave

      const partyId = participant.party;

      await Participant.findByIdAndDelete(participantId);

      const party = await Party.findById(partyId);
      if (!party) return;

      const newCount = Math.max(0, (party.participantsCount || 0) - 1);

      const update = {
        participantsCount: newCount,
        lastActive: Date.now(),
      };

      if (newCount === 0) {
        update.isActive = false;
      }

      await Party.findByIdAndUpdate(partyId, { $set: update });
    } catch (err) {
      console.error("Error cleaning up participant on disconnect:", err.message);
    }
  }

  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    // ======================================================
    // JOIN ROOM
    // ======================================================
    socket.on("join-room", ({ partyId, participantId, displayName }) => {
      if (!partyId || !participantId) return;

      socket.join(partyId);

      if (!rooms[partyId]) rooms[partyId] = [];

      rooms[partyId].push({
        socketId: socket.id,
        participantId,
        displayName,
      });

      console.log(`➡️ ${displayName} joined ${partyId}`);

      // Send updated participant list to all
      io.to(partyId).emit("participants-update", rooms[partyId]);

      // Mark party as active
      touchParty(partyId);

      // Send existing whiteboard history TO NEW USER ONLY
      if (whiteboardStrokes[partyId] && whiteboardStrokes[partyId].length > 0) {
        socket.emit("whiteboard:state", {
          partyId,
          strokes: whiteboardStrokes[partyId],
        });
      }
    });

    // ======================================================
    // LEAVE ROOM (logical leave from frontend)
    // ======================================================
    socket.on("leave-room", ({ partyId }) => {
      if (!partyId) return;

      if (rooms[partyId]) {
        rooms[partyId] = rooms[partyId].filter(
          (p) => p.socketId !== socket.id
        );
      }

      io.to(partyId).emit("participants-update", rooms[partyId] || []);
      socket.leave(partyId);

      console.log(`⛔ Socket ${socket.id} left room ${partyId}`);
      touchParty(partyId);
    });

    // ======================================================
    // DISCONNECT (tab closed / network lost)
    // ======================================================
    socket.on("disconnect", async () => {
      console.log("❌ Socket disconnected:", socket.id);

      // For each room, find participants belonging to this socket
      for (const roomId in rooms) {
        const room = rooms[roomId];
        if (!room || room.length === 0) continue;

        const leaving = room.filter((p) => p.socketId === socket.id);
        if (leaving.length === 0) continue;

        // Remove them from in-memory room
        rooms[roomId] = room.filter((p) => p.socketId !== socket.id);

        io.to(roomId).emit("participants-update", rooms[roomId] || []);

        // Clean up DB for each participantId that belonged to this socket
        for (const lp of leaving) {
          if (lp.participantId) {
            await cleanupParticipant(lp.participantId);
          }
        }
      }
    });

    // ======================================================
    // CHAT SYSTEM
    // ======================================================
    socket.on("chat:send", (msg) => {
      if (!msg || !msg.party) return;
      io.to(msg.party).emit("chat:new", msg);
      touchParty(msg.party);
    });

    // ======================================================
    // MEDIA SYNC
    // ======================================================
    socket.on("media:sync", ({ partyId, state }) => {
      if (!partyId || !state) return;
      socket.to(partyId).emit("media:update", state);
      touchParty(partyId);
    });

    // ======================================================
    // WHITEBOARD SYNC (PERSISTENT)
    // ======================================================
    socket.on("whiteboard:draw", ({ partyId, stroke }) => {
      if (!partyId || !stroke) return;

      if (!whiteboardStrokes[partyId]) whiteboardStrokes[partyId] = [];
      whiteboardStrokes[partyId].push(stroke);

      socket.to(partyId).emit("whiteboard:update", stroke);
      touchParty(partyId);
    });

    socket.on("whiteboard:clear", ({ partyId }) => {
      if (!partyId) return;

      whiteboardStrokes[partyId] = []; // reset memory
      io.to(partyId).emit("whiteboard:clear");
      touchParty(partyId);
    });

    // ======================================================
    // CAM / MIC / SCREEN SHARE
    // ======================================================
    socket.on("av:update", ({ partyId, participantId, status }) => {
      if (!partyId || !participantId) return;
      socket.to(partyId).emit("av:update", { participantId, status });
      touchParty(partyId);
    });

    socket.on("screen-share", ({ partyId, participantId, isSharing }) => {
      if (!partyId || !participantId) return;
      socket.to(partyId).emit("screen-share", { participantId, isSharing });
      touchParty(partyId);
    });

    // ======================================================
    // HOST CONTROLS
    // ======================================================
    socket.on("host:kick", ({ partyId, participantId }) => {
      if (!partyId || !participantId) return;
      io.to(partyId).emit("host:kick", participantId);
      touchParty(partyId);
    });

    socket.on("host:toggle-chat", ({ partyId, value }) => {
      if (!partyId) return;
      io.to(partyId).emit("host:toggle-chat", value);
      touchParty(partyId);
    });

    socket.on("host:toggle-screen", ({ partyId, value }) => {
      if (!partyId) return;
      io.to(partyId).emit("host:toggle-screen", value);
      touchParty(partyId);
    });

    // ======================================================
    // WEBRTC (CAM/MIC/SCREEN)
    // ======================================================
    socket.on("webrtc:offer", ({ partyId, to, offer }) => {
      if (!partyId || !to || !offer) return;
      io.to(to).emit("webrtc:offer", {
        from: socket.id,
        partyId,
        offer,
      });
      touchParty(partyId);
    });

    socket.on("webrtc:answer", ({ partyId, to, answer }) => {
      if (!partyId || !to || !answer) return;
      io.to(to).emit("webrtc:answer", {
        from: socket.id,
        partyId,
        answer,
      });
      touchParty(partyId);
    });

    socket.on("webrtc:ice-candidate", ({ partyId, to, candidate }) => {
      if (!partyId || !to || !candidate) return;
      io.to(to).emit("webrtc:ice-candidate", {
        from: socket.id,
        partyId,
        candidate,
      });
      touchParty(partyId);
    });
  });
};
