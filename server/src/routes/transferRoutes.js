const express = require('express');
const router = express.Router();
const { getTransfers, executeTransfer } = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getTransfers);
router.post('/', executeTransfer);

module.exports = router;
