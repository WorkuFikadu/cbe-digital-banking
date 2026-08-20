const prisma = require('../utils/prismaClient');

exports.getVaults = async (req, res) => {
  try {
    let vaults = await prisma.vault.findMany({ where: { userId: req.user.id } });
    
    // Seed default vault if empty
    if (vaults.length === 0) {
      const defaultVault = await prisma.vault.create({
        data: {
          name: 'Emergency Savings Fund',
          targetAmount: 100000,
          currentAmount: 25000,
          category: 'Emergency',
          roundUpEnabled: true,
          userId: req.user.id
        }
      });
      vaults = [defaultVault];
    }

    res.json(vaults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vaults' });
  }
};

exports.createVault = async (req, res) => {
  try {
    const { name, targetAmount, initialAmount, category, roundUpEnabled } = req.body;
    const vault = await prisma.vault.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount) || 10000,
        currentAmount: parseFloat(initialAmount) || 0,
        category: category || 'Goal',
        roundUpEnabled: Boolean(roundUpEnabled),
        userId: req.user.id
      }
    });

    res.status(201).json(vault);
  } catch (error) {
    res.status(500).json({ message: 'Error creating vault' });
  }
};

exports.depositToVault = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, accountId } = req.body;
    const depositAmt = parseFloat(amount);

    if (!depositAmt || depositAmt <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    const vault = await prisma.vault.findUnique({ where: { id } });
    if (!vault || vault.userId !== req.user.id) {
      return res.status(404).json({ message: 'Vault not found' });
    }

    if (accountId) {
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (account && account.balance >= depositAmt) {
        await prisma.account.update({
          where: { id: accountId },
          data: { balance: account.balance - depositAmt }
        });
      }
    }

    const updatedVault = await prisma.vault.update({
      where: { id },
      data: { currentAmount: vault.currentAmount + depositAmt }
    });

    res.json(updatedVault);
  } catch (error) {
    res.status(500).json({ message: 'Error depositing to vault' });
  }
};
