const MediaState = require('../models/MediaState');
const { success, error: respError } = require('../utils/responseHandler');
const { requiredFields } = require('../utils/validators');

exports.getMediaState = async (req, res) => {
  try {
    const partyId = req.query.partyId || req.params.partyId;
    if (!partyId) {
      return respError(res, 'partyId required', 400);
    }

    let state = await MediaState.findOne({ party: partyId });
    if (!state) {
      state = await MediaState.create({ party: partyId });
    }

    return success(res, { state });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.updateMediaState = async (req, res) => {
  try {
    const missing = requiredFields(req.body, ['partyId']);
    if (missing.length) {
      return respError(res, 'Missing required fields: ' + missing.join(', '), 400);
    }

    const { partyId, videoUrl, provider, currentTime, isPlaying, playbackRate, volume } = req.body;

    const updates = {};
    if (videoUrl !== undefined) updates.videoUrl = videoUrl;
    if (provider !== undefined) updates.provider = provider;
    if (currentTime !== undefined) updates.currentTime = currentTime;
    if (isPlaying !== undefined) updates.isPlaying = isPlaying;
    if (playbackRate !== undefined) updates.playbackRate = playbackRate;
    if (volume !== undefined) updates.volume = volume;
    updates.lastUpdated = Date.now();

    const state = await MediaState.findOneAndUpdate(
      { party: partyId },
      updates,
      { upsert: true, new: true }
    );

    return success(res, { state });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};
