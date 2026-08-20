const prisma = require('../utils/prismaClient');

exports.getTransfers = async (req, res) => {
  try {
    const userAccounts = await prisma.account.findMany({ where: { userId: req.user.id } });
    const accountIds = userAccounts.map(a => a.id);
    const transfers = await prisma.transfer.findMany({
      where: { senderAccountId: { in: accountIds } },
      orderBy: { date: 'desc' }
    });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transfers' });
  }
};

exports.executeTransfer = async (req, res) => {
  try {
    const { senderAccountId, receiverAccountNumber, receiverName, amount, notes } = req.body;
    const transferAmount = parseFloat(amount);

    if (!senderAccountId || !receiverAccountNumber || !transferAmount || transferAmount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer details' });
    }

    const senderAccount = await prisma.account.findUnique({ where: { id: senderAccountId } });
    if (!senderAccount || senderAccount.userId !== req.user.id) {
      return res.status(404).json({ message: 'Sender account not found' });
    }

    if (senderAccount.balance < transferAmount) {
      return res.status(400).json({ message: 'Insufficient funds in sender account' });
    }

    const reference = 'CBE-FT-' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);

    // Deduct balance from sender
    await prisma.account.update({
      where: { id: senderAccountId },
      data: { balance: senderAccount.balance - transferAmount }
    });

    // Create Transaction record for history
    await prisma.transaction.create({
      data: {
        amount: transferAmount,
        type: 'Expense',
        category: 'Fund Transfer',
        paymentMethod: 'CBE Birr / Direct Transfer',
        notes: `Transfer to ${receiverName || receiverAccountNumber} (Ref: ${reference})`,
        accountId: senderAccountId
      }
    });

    // If receiver account exists in system, credit them
    const receiverAccount = await prisma.account.findFirst({ where: { accountNumber: receiverAccountNumber } });
    if (receiverAccount) {
      await prisma.account.update({
        where: { id: receiverAccount.id },
        data: { balance: receiverAccount.balance + transferAmount }
      });

      await prisma.transaction.create({
        data: {
          amount: transferAmount,
          type: 'Income',
          category: 'Fund Transfer',
          paymentMethod: 'CBE Birr / Direct Transfer',
          notes: `Received from ${senderAccount.name} (${senderAccount.accountNumber})`,
          accountId: receiverAccount.id
        }
      });
    }

    // Save Transfer log
    const transferLog = await prisma.transfer.create({
      data: {
        senderAccountId,
        receiverAccountNumber,
        receiverName: receiverName || 'CBE Account Holder',
        amount: transferAmount,
        currency: senderAccount.currency,
        reference,
        status: 'Completed'
      }
    });

    res.status(201).json({
      message: 'Transfer successful',
      transfer: transferLog,
      newBalance: senderAccount.balance - transferAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Transfer failed' });
  }
};
