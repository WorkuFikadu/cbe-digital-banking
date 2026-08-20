const prisma = require('../utils/prismaClient');

exports.getTransactions = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({ where: { userId: req.user.id }, select: { id: true } });
    const accountIds = accounts.map(a => a.id);
    
    const transactions = await prisma.transaction.findMany({
      where: { accountId: { in: accountIds } },
      orderBy: { date: 'desc' },
      include: { account: { select: { name: true } } }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, paymentMethod, notes, accountId } = req.body;
    
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized for this account' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        paymentMethod,
        notes,
        accountId
      }
    });

    let newBalance = account.balance;
    if (type === 'Income') newBalance += parseFloat(amount);
    else if (type === 'Expense') newBalance -= parseFloat(amount);
    
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance }
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction' });
  }
};
