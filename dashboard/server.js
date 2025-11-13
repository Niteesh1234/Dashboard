const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB (Atlas in production, local in development)
const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/orders_db?authSource=admin';
mongoose.connect(mongoUri).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Transaction schema (updated to match new MySQL schema)
const transactionSchema = new mongoose.Schema({
  id: Number,
  customer_id: Number,
  product_id: Number,
  store_id: Number,
  transaction_type: String,
  quantity: Number,
  unit_price: Number,
  total_amount: Number,
  transaction_date: Date,
  status: String,
  notes: String,
  original_transaction_id: Number,
  // Joined fields from MySQL query
  customer_name: String,
  product_name: String,
  category_name: String,
  subcategory_name: String,
  store_name: String,
  store_location: String,
  original_transaction_type: String
}, { collection: 'transactions' });

const Transaction = mongoose.model('Transaction', transactionSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    // Fetch all transactions from API
    const apiUrl = process.env.API_URL || 'http://api:3000';
    const [transactionsResponse, summaryResponse] = await Promise.all([
      fetch(`${apiUrl}/api/transactions`),
      fetch(`${apiUrl}/api/stats/summary`)
    ]);

    const transactions = await transactionsResponse.json();
    const summary = await summaryResponse.json();

    // Extract data from stored procedure results
    const totalTransactions = summary.overview.total_transactions;
    const totalRevenue = parseFloat(summary.overview.total_sales_revenue);

    // Convert transaction type stats to the expected format
    const transactionTypeStats = {};
    summary.transactionTypes.forEach(stat => {
      transactionTypeStats[stat.transaction_type] = {
        count: stat.transaction_count,
        revenue: parseFloat(stat.total_amount)
      };
    });

    // Convert category stats to the expected format
    const categoryStats = {};
    summary.categories.forEach(stat => {
      categoryStats[stat.category_name] = {
        count: stat.transaction_count,
        revenue: parseFloat(stat.total_revenue)
      };
    });

    res.render('index', {
      transactions,
      totalTransactions,
      totalRevenue,
      transactionTypeStats,
      categoryStats
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Error loading dashboard');
  }
});

app.get('/data', async (req, res) => {
  try {
    // Fetch all transactions from API
    const apiUrl = process.env.API_URL || 'http://api:3000';
    const apiResponse = await fetch(`${apiUrl}/api/transactions`);
    const transactions = await apiResponse.json();

    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.total_amount), 0);

    res.json({
      transactions,
      totalTransactions,
      totalRevenue
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Dashboard running on http://localhost:${PORT}`);
});
