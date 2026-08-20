const express = require('express');
const router = express.Router();
const { getVaults, createVault, depositToVault } = require('../controllers/vaultController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getVaults);
router.post('/', createVault);
router.post('/:id/deposit', depositToVault);

module.exports = router;
