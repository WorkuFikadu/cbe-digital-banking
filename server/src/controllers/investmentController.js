const prisma = require('../utils/prismaClient');

exports.getInvestments = async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({ where: { userId: req.user.id } });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

exports.createInvestment = async (req, res) => {
  try {
    const { name, type, quantity, purchasePrice, currentPrice } = req.body;
    const investment = await prisma.investment.create({
      data: {
        name,
        type,
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(purchasePrice),
        currentPrice: currentPrice ? parseFloat(currentPrice) : parseFloat(purchasePrice),
        userId: req.user.id
      }
    });
    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating investment' });
  }
};

exports.updateInvestmentPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPrice } = req.body;
    const investment = await prisma.investment.update({
      where: { id, userId: req.user.id },
      data: { currentPrice: parseFloat(currentPrice) }
    });
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating investment price' });
  }
};
