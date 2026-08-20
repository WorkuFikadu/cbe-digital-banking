const prisma = require('../utils/prismaClient');

exports.getBillPayments = async (req, res) => {
  try {
    const bills = await prisma.billPayment.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill payments' });
  }
};

exports.payBill = async (req, res) => {
  try {
    const { provider, accountNo, amount, accountId } = req.body;
    const billAmount = parseFloat(amount);

    if (!provider || !accountNo || !billAmount || billAmount <= 0 || !accountId) {
      return res.status(400).json({ message: 'Invalid bill payment details' });
    }

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== req.user.id) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.balance < billAmount) {
      return res.status(400).json({ message: 'Insufficient balance to pay bill' });
    }

    const receiptNo = 'CBE-BILL-' + Math.floor(10000000 + Math.random() * 90000000);

    // Deduct balance
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: account.balance - billAmount }
    });

    // Record transaction
    await prisma.transaction.create({
      data: {
        amount: billAmount,
        type: 'Expense',
        category: 'Bill Payment',
        paymentMethod: 'CBE Direct Pay',
        notes: `Paid ${provider} bill (#${accountNo}). Receipt: ${receiptNo}`,
        accountId: accountId
      }
    });

    // Create BillPayment log
    const billLog = await prisma.billPayment.create({
      data: {
        userId: req.user.id,
        provider,
        accountNo,
        amount: billAmount,
        receiptNo,
        status: 'Success'
      }
    });

    res.status(201).json({
      message: 'Bill payment successful',
      receipt: billLog,
      newBalance: account.balance - billAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Bill payment failed' });
  }
};
