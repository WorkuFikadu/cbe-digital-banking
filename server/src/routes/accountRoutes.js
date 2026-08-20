const express = require('express');
const { getAccounts, createAccount, deleteAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.route('/').get(getAccounts).post(createAccount);
router.route('/:id').delete(deleteAccount);

module.exports = router;
