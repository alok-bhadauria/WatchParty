const express = require('express');
const router = express.Router();
const party = require('../controllers/partyController');
const authMiddleware = require('../middleware/authMiddleware');
const requireHost = require('../middleware/requireHost');

// Create new party (host must be logged in)
router.post('/', authMiddleware, party.createParty);

// List parties (public list – can keep open or require auth if you want)
router.get('/', party.listParties);

// Get specific party info
router.get('/:id', party.getParty);

// Update party (host only)
router.put('/:id', authMiddleware, requireHost, party.updateParty);

// Delete party (host only)
router.delete('/:id', authMiddleware, requireHost, party.deleteParty);

// Verify password
router.post('/verify-password', authMiddleware, party.verifyPartyPassword);

module.exports = router;
