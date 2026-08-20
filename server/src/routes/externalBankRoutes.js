const express = require('express');
const router = express.Router();
const { getExternalBanks, linkExternalBank, ethswitchTransfer } = require('../controllers/externalBankController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getExternalBanks);
router.post('/link', linkExternalBank);
router.post('/ethswitch', ethswitchTransfer);

module.exports = router;
