const express = require('express');
const router = express.Router();
const msg = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// Send a message
router.post('/', authMiddleware, msg.sendMessage);

// Get messages for a party
router.get('/party/:partyId', authMiddleware, msg.getMessages);

// Delete a message
router.delete('/:id', authMiddleware, msg.deleteMessage);

module.exports = router;
