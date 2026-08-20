const express = require('express');
const router = express.Router();
const { getCards, createCard, toggleFreeze, toggleSetting } = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getCards);
router.post('/', createCard);
router.put('/:id/freeze', toggleFreeze);
router.put('/:id/settings', toggleSetting);

module.exports = router;
