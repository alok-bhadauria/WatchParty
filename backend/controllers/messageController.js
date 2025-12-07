const Message = require('../models/Message');
const { success, error: respError } = require('../utils/responseHandler');
const { requiredFields } = require('../utils/validators');

exports.sendMessage = async (req, res) => {
  try {
    const missing = requiredFields(req.body, ['party', 'content']);
    if (missing.length) {
      return respError(res, 'Missing required fields: ' + missing.join(', '), 400);
    }

    const { party, content, type } = req.body;
    const user = req.user;

    const msg = await Message.create({
      party,
      user: user._id,
      senderName: user.watchName || user.username || user.name,
      content,
      type: type || 'text',
    });

    return success(res, { message: msg }, 201);
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const partyId = req.query.partyId || req.params.partyId;
    if (!partyId) {
      return respError(res, 'partyId required', 400);
    }

    const limit = parseInt(req.query.limit || '200', 10);
    const messages = await Message.find({ party: partyId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .sort({ createdAt: 1 });

    return success(res, { messages });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const msg = await Message.findById(id);
    if (!msg) {
      return respError(res, 'Message not found', 404);
    }

    // Only sender or (later) host can delete; for now: only sender
    if (msg.user.toString() !== req.user._id.toString()) {
      return respError(res, 'Forbidden', 403);
    }

    await msg.deleteOne();
    return success(res, {});
  } catch (err) {
    return respError(res, err.message, 500);
  }
};
