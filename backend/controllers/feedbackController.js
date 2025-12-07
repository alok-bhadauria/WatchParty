const Feedback = require('../models/Feedback');
const { success, error: respError } = require('../utils/responseHandler');
const { requiredFields } = require('../utils/validators');

exports.createFeedback = async (req, res) => {
  try {
    const missing = requiredFields(req.body, ['message']);
    if (missing.length) {
      return respError(res, 'Missing required fields: ' + missing.join(', '), 400);
    }

    const { message, rating } = req.body;
    const user = req.user ? req.user._id : null;

    const feedback = await Feedback.create({
      user,
      message,
      rating: rating || 5,
    });

    return success(res, { feedback }, 201);
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.listFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(200);

    return success(res, { feedbacks });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return respError(res, 'Not found', 404);
    }

    // Optionally only allow admins. For now: any logged-in user is blocked from deleting others
    if (feedback.user && feedback.user.toString() !== req.user._id.toString()) {
      return respError(res, 'Forbidden', 403);
    }

    await feedback.deleteOne();
    return success(res, {});
  } catch (err) {
    return respError(res, err.message, 500);
  }
};
