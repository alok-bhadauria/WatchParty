const Participant = require('../models/Participant');
const Party = require('../models/Party');
const { success, error: respError } = require('../utils/responseHandler');
const { requiredFields } = require('../utils/validators');

// --------------------------------------------------
// JOIN PARTY
// --------------------------------------------------
exports.joinParty = async (req, res) => {
  try {
    const missing = requiredFields(req.body, ["partyId", "displayName"]);
    if (missing.length)
      return respError(
        res,
        "Missing required fields: " + missing.join(", "),
        400
      );

    const { partyId, displayName, avatar, isAnonymous } = req.body;
    const userId = req.user ? req.user._id : null;

    const party = await Party.findById(partyId);
    if (!party) return respError(res, "Party not found", 404);

    let participantDoc = null;
    let incrementCount = true;

    if (userId) {
      // For logged-in users, reuse participant if it already exists
      participantDoc = await Participant.findOne({ party: partyId, user: userId });

      if (participantDoc) {
        incrementCount = false; // don't double count
        participantDoc.displayName = displayName;
        participantDoc.avatar = avatar || participantDoc.avatar;
        participantDoc.isAnonymous = !!isAnonymous;
        participantDoc.lastActiveAt = Date.now();
      } else {
        participantDoc = new Participant({
          party: partyId,
          user: userId,
          displayName,
          avatar: avatar || "",
          isAnonymous: !!isAnonymous,
        });
      }

      // mark host if this user is the party host
      if (party.host.toString() === userId.toString()) {
        participantDoc.isHost = true;
      }
    } else {
      // Anonymous guest
      participantDoc = new Participant({
        party: partyId,
        user: null,
        displayName,
        avatar: avatar || "",
        isAnonymous: !!isAnonymous,
      });
    }

    await participantDoc.save();

    // Always bump lastActive; only increment count for truly new participant
    const update = {
      $set: {
        lastActive: Date.now(),
        isActive: true,
      },
    };

    if (incrementCount) {
      update.$inc = { participantsCount: 1 };
    }

    await Party.findByIdAndUpdate(partyId, update);

    return success(res, { participant: participantDoc }, 201);
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// --------------------------------------------------
// LEAVE PARTY
// --------------------------------------------------
exports.leaveParty = async (req, res) => {
  try {
    const participantId = req.params.id;
    const participant = await Participant.findById(participantId);

    if (!participant) return respError(res, "Participant not found", 404);

    const partyId = participant.party;

    // remove participant
    await Participant.findByIdAndDelete(participantId);

    // safely decrement (not below 0)
    const party = await Party.findById(partyId);
    if (!party) return success(res, { left: true });

    const newCount = Math.max(0, (party.participantsCount || 0) - 1);

    const update = {
      participantsCount: newCount,
      lastActive: Date.now(),
    };

    // if empty → mark inactive
    if (newCount === 0) {
      update.isActive = false;
    }

    await Party.findByIdAndUpdate(partyId, { $set: update });

    return success(res, { left: true });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// --------------------------------------------------
// LIST PARTICIPANTS
// --------------------------------------------------
exports.listParticipants = async (req, res) => {
  try {
    const partyId = req.query.partyId || req.params.partyId;
    if (!partyId) return respError(res, 'partyId required', 400);

    const participants = await Participant.find({ party: partyId })
      .sort({ joinedAt: 1 });

    return success(res, { participants });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// --------------------------------------------------
// UPDATE PARTICIPANT
// --------------------------------------------------
exports.updateParticipant = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const p = await Participant.findByIdAndUpdate(id, updates, { new: true });
    if (!p) return respError(res, 'Participant not found', 404);

    return success(res, { participant: p });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};
