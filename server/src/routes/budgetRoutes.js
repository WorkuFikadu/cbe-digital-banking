const express = require('express');
const { getBudgets, createBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.route('/').get(getBudgets).post(createBudget);
router.route('/:id').delete(deleteBudget);

module.exports = router;
