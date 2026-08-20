const prisma = require('../utils/prismaClient');

const generateCardDetails = (type) => {
  const prefix = type === 'Virtual' ? '4532' : type === 'Disposable' ? '5412' : '4111';
  const randDigits = Math.floor(1000 + Math.random() * 9000).toString();
  const cardNumber = `${prefix} **** **** ${randDigits}`;
  const expiry = '08/29';
  const cvv = Math.floor(100 + Math.random() * 900).toString();
  return { cardNumber, expiry, cvv };
};

exports.getCards = async (req, res) => {
  try {
    let cards = await prisma.card.findMany({ where: { userId: req.user.id } });
    
    // Seed default cards if empty
    if (cards.length === 0) {
      const virtualCard = await prisma.card.create({
        data: {
          cardNumber: '4532 **** **** 8890',
          cardHolder: req.user.name.toUpperCase(),
          expiry: '11/28',
          cvv: '742',
          type: 'Virtual',
          status: 'Active',
          onlinePayEnabled: true,
          atmEnabled: false,
          spendingLimit: 100000,
          userId: req.user.id
        }
      });
      cards = [virtualCard];
    }

    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cards' });
  }
};

exports.createCard = async (req, res) => {
  try {
    const { type, spendingLimit } = req.body;
    const { cardNumber, expiry, cvv } = generateCardDetails(type);

    const card = await prisma.card.create({
      data: {
        cardNumber,
        cardHolder: req.user.name.toUpperCase(),
        expiry,
        cvv,
        type: type || 'Virtual',
        status: 'Active',
        onlinePayEnabled: true,
        atmEnabled: type === 'Physical',
        spendingLimit: parseFloat(spendingLimit) || 50000,
        userId: req.user.id
      }
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Error creating card' });
  }
};

exports.toggleFreeze = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card || card.userId !== req.user.id) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const updated = await prisma.card.update({
      where: { id },
      data: { status: card.status === 'Active' ? 'Frozen' : 'Active' }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling card status' });
  }
};

exports.toggleSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { onlinePayEnabled, atmEnabled } = req.body;

    const card = await prisma.card.findUnique({ where: { id } });
    if (!card || card.userId !== req.user.id) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const updated = await prisma.card.update({
      where: { id },
      data: {
        ...(onlinePayEnabled !== undefined && { onlinePayEnabled }),
        ...(atmEnabled !== undefined && { atmEnabled })
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating card settings' });
  }
};
