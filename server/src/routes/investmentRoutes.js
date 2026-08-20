const express = require('express');
const { getInvestments, createInvestment, updateInvestmentPrice } = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.route('/').get(getInvestments).post(createInvestment);
router.route('/:id').patch(updateInvestmentPrice);

module.exports = router;
