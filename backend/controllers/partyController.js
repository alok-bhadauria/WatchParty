const Party = require('../models/Party');
const generatePartyCode = require('../utils/generatePartyCode');
const { success, error: respError } = require('../utils/responseHandler');
const { requiredFields } = require('../utils/validators');

// --------------------------------------------------
// CREATE PARTY
// --------------------------------------------------
exports.createParty = async (req, res) => {
  try {
    const missing = requiredFields(req.body, ['name']);
    if (missing.length) {
      return respError(res, 'Missing required fields: ' + missing.join(', '), 400);
    }

    const {
      name,
      description,
      isPrivate,
      password,
      settings,
      maxParticipants,   // ⬅ from frontend
    } = req.body;

    const hostId = req.user ? req.user._id : req.body.host; // prefer authenticated user

    // Generate unique code
    let code = generatePartyCode(6);
    while (await Party.findOne({ code })) {
      code = generatePartyCode(6);
    }

    // Normalize settings
    const finalSettings = {
      allowAnonymous: false,
      enableChat: true,
      enableAudio: true,
      enableVideo: true,
      enableWhiteboard: true,
      theme: 'default',
      maxParticipants: 50,
      ...(settings || {}),
    };

    if (typeof maxParticipants === 'number') {
      finalSettings.maxParticipants = maxParticipants;
    }

    const party = new Party({
      name,
      description,
      host: hostId,
      code,
      isPrivate: !!isPrivate,
      password: password || '',
      settings: finalSettings,
      participantsCount: 0,
      isActive: true,
      lastActive: Date.now(),
    });

    await party.save();

    // ✅ NO auto host participant here.
    // Host will join via /participants/join like everyone else.

    return success(res, { party }, 201);
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// --------------------------------------------------
// GET SINGLE PARTY
// --------------------------------------------------
exports.getParty = async (req, res) => {
  try {
    const id = req.params.id;
    const party = await Party.findById(id).populate('host', 'name username avatar');
    if (!party) return respError(res, 'Party not found', 404);
    return success(res, { party });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

/**
 * listParties:
 * - if ?public=true → only public parties
 * - otherwise → all parties
 * - shows only "fresh" parties:
 *   - participantsCount > 0 OR created within last 3 hours
 */
exports.listParties = async (req, res) => {
  try {
    // Parties that had any activity in last 5 minutes
    const cutoff = new Date(Date.now() - 5 * 60 * 1000);

    const filter = {
      lastActive: { $gte: cutoff },
    };

    // Only public parties if requested
    if (req.query.public === "true") {
      filter.isPrivate = false;
    }

    const parties = await Party.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("host", "name username avatar");

    return success(res, { parties });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.updateParty = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body, updatedAt: Date.now() };
    const party = await Party.findByIdAndUpdate(id, updates, { new: true });
    if (!party) return respError(res, 'Party not found', 404);
    return success(res, { party });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.deleteParty = async (req, res) => {
  try {
    const id = req.params.id;
    const party = await Party.findByIdAndDelete(id);
    if (!party) return respError(res, 'Party not found', 404);
    // TODO: cleanup participants/messages/media/etc if needed
    return success(res, {});
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.verifyPartyPassword = async (req, res) => {
  try {
    const { code, password } = req.body;
    const party = await Party.findOne({ code });
    if (!party) return respError(res, 'Party not found', 404);
    if (!party.isPrivate) return success(res, { ok: true });
    const match = await party.comparePassword(password || '');
    if (!match) return respError(res, 'Invalid password', 403);
    return success(res, { ok: true });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};
