const express = require('express');
const router = express.Router();
const feedback = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

// Create feedback
router.post('/', authMiddleware, feedback.createFeedback);

// List feedback (optional: restrict to admin later)
router.get('/', authMiddleware, feedback.listFeedback);

// Delete feedback (only owner for now)
router.delete('/:id', authMiddleware, feedback.deleteFeedback);

module.exports = router;
