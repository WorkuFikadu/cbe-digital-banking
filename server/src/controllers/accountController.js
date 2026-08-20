const prisma = require('../utils/prismaClient');

const generateCBEAccountNumber = () => {
  return '1000' + Math.floor(100000000 + Math.random() * 900000000).toString();
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({ where: { userId: req.user.id } });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accounts' });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, type, balance, currency } = req.body;
    const account = await prisma.account.create({
      data: {
        name,
        type,
        accountNumber: generateCBEAccountNumber(),
        balance: parseFloat(balance) || 0,
        currency: currency || 'ETB',
        userId: req.user.id
      }
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error creating account' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.account.delete({ where: { id } });
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
};
