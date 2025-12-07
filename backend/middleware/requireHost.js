const Party = require('../models/Party');

module.exports = async function requireHost(req, res, next) {
  try {
    const partyId = req.params.partyId || req.params.id || req.body.partyId || req.body.party;
    if (!partyId) {
      return res.status(400).json({ success: false, error: 'Party id required' });
    }

    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }

    if (!req.user || party.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Host privileges required' });
    }

    req.party = party;
    next();
  } catch (err) {
    next(err);
  }
};
