const prisma = require('../utils/prismaClient');

exports.getExternalBanks = async (req, res) => {
  try {
    let links = await prisma.externalBankLink.findMany({ where: { userId: req.user.id } });
    
    // Seed realistic Ethiopian bank connections if empty
    if (links.length === 0) {
      const defaultLinks = [
        {
          bankName: 'Awash Bank',
          accountNumber: 'AW77001982',
          accountHolder: req.user.name,
          balance: 45000.00,
          status: 'Connected',
          userId: req.user.id
        },
        {
          bankName: 'Bank of Abyssinia',
          accountNumber: 'BOA-8839102',
          accountHolder: req.user.name,
          balance: 28500.50,
          status: 'Connected',
          userId: req.user.id
        },
        {
          bankName: 'Telebirr SuperApp Wallet',
          accountNumber: '0911234567',
          accountHolder: req.user.name,
          balance: 6420.00,
          status: 'Connected',
          userId: req.user.id
        }
      ];

      for (const d of defaultLinks) {
        await prisma.externalBankLink.create({ data: d });
      }
      links = await prisma.externalBankLink.findMany({ where: { userId: req.user.id } });
    }

    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching linked local banks' });
  }
};

exports.linkExternalBank = async (req, res) => {
  try {
    const { bankName, accountNumber, initialBalance } = req.body;

    const link = await prisma.externalBankLink.create({
      data: {
        bankName,
        accountNumber,
        accountHolder: req.user.name,
        balance: parseFloat(initialBalance) || 1000,
        status: 'Connected',
        userId: req.user.id
      }
    });

    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Error linking Ethiopian bank account' });
  }
};

exports.ethswitchTransfer = async (req, res) => {
  try {
    const { fromBankId, toBankName, toAccountNumber, toAccountHolder, amount } = req.body;
    const transferAmt = parseFloat(amount);
    const ethswitchFee = 5.0; // 5 ETB Ethswitch interbank switch fee

    if (!transferAmt || transferAmt <= 0) {
      return res.status(400).json({ message: 'Invalid interbank transfer amount' });
    }

    // Check if source is a CBE Account
    const cbeAccount = await prisma.account.findUnique({ where: { id: fromBankId } });
    if (cbeAccount && cbeAccount.userId === req.user.id) {
      if (cbeAccount.balance < transferAmt + ethswitchFee) {
        return res.status(400).json({ message: 'Insufficient funds for Ethswitch interbank transfer + 5 ETB fee' });
      }

      // Deduct from CBE
      await prisma.account.update({
        where: { id: fromBankId },
        data: { balance: cbeAccount.balance - (transferAmt + ethswitchFee) }
      });

      // Log transaction
      const reference = 'ETHSWITCH-' + Math.floor(10000000 + Math.random() * 90000000);
      await prisma.transaction.create({
        data: {
          amount: transferAmt,
          type: 'Expense',
          category: 'Interbank Transfer (Ethswitch)',
          paymentMethod: 'Ethswitch National Network',
          notes: `Sent to ${toBankName} (${toAccountNumber} - ${toAccountHolder}). Ref: ${reference}`,
          accountId: fromBankId
        }
      });

      return res.status(201).json({
        message: 'Ethswitch Interbank transfer successful',
        reference,
        newBalance: cbeAccount.balance - (transferAmt + ethswitchFee)
      });
    }

    res.status(400).json({ message: 'Invalid source account selected' });
  } catch (error) {
    res.status(500).json({ message: 'Ethswitch Interbank transfer failed' });
  }
};
