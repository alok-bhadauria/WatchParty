const express = require('express');
const router = express.Router();
const media = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');

// Get media state
router.get('/party/:partyId', authMiddleware, media.getMediaState);

// Update media state
router.post('/update', authMiddleware, media.updateMediaState);

module.exports = router;
