const express = require("express");
const router = express.Router();

const participant = require("../controllers/participantController");
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

// Join party (can be anonymous OR logged-in)
router.post("/join", optionalAuth, participant.joinParty);

// Leave party (authenticated OR anonymous)
router.delete("/:id", participant.leaveParty);

// List participants (public)
router.get("/list/:partyId", participant.listParticipants);

// Update participant (rename, avatar, etc.) — logged-in only
router.put("/:id", auth, participant.updateParticipant);

module.exports = router;
