const prisma = require('../utils/prismaClient');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({ where: { userId: req.user.id } });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;
    const budget = await prisma.budget.create({
      data: {
        category,
        amount: parseFloat(amount),
        month: month || new Date().toISOString().slice(0, 7), // YYYY-MM
        userId: req.user.id
      }
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Error creating budget' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.budget.delete({ where: { id, userId: req.user.id } });
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting budget' });
  }
};
