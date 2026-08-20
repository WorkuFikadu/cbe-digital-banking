const express = require('express');
const router = express.Router();
const { getBillPayments, payBill } = require('../controllers/billPaymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getBillPayments);
router.post('/', payBill);

module.exports = router;
