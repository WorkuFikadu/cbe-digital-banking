const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/accounts', require('./src/routes/accountRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));
app.use('/api/budgets', require('./src/routes/budgetRoutes'));
app.use('/api/investments', require('./src/routes/investmentRoutes'));
app.use('/api/transfers', require('./src/routes/transferRoutes'));
app.use('/api/bills', require('./src/routes/billPaymentRoutes'));
app.use('/api/cards', require('./src/routes/cardRoutes'));
app.use('/api/vaults', require('./src/routes/vaultRoutes'));
app.use('/api/external-banks', require('./src/routes/externalBankRoutes'));

app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head><title>CBE Online Banking API</title></head>
      <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc;">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; margin-bottom: 8px;">CBE Online Banking API</h1>
          <p style="color: #64748b;">Backend Server is Active and Running on Port ${PORT}</p>
          <a href="http://localhost:5173" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #2563eb; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to CBE Frontend App</a>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CBE Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
