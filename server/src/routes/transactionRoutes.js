const express = require('express');
const { getTransactions, createTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.route('/').get(getTransactions).post(createTransaction);

module.exports = router;
