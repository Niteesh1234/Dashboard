const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'mysql',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'rootpassword',
  database: process.env.MYSQL_DATABASE || 'orders'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Get all categories
app.get('/api/categories', (req, res) => {
  db.execute('SELECT * FROM categories ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(results);
  });
});

// Get subcategories for a category
app.get('/api/categories/:categoryId/subcategories', (req, res) => {
  const { categoryId } = req.params;
  db.execute('SELECT * FROM subcategories WHERE category_id = ? ORDER BY name', [categoryId], (err, results) => {
    if (err) {
      console.error('Error fetching subcategories:', err);
      return res.status(500).json({ error: 'Failed to fetch subcategories' });
    }
    res.json(results);
  });
});

// Get all customers
app.get('/api/customers', (req, res) => {
  db.execute('SELECT * FROM customers ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
    res.json(results);
  });
});

// Get all stores
app.get('/api/stores', (req, res) => {
  db.execute('SELECT * FROM stores ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).json({ error: 'Failed to fetch stores' });
    }
    res.json(results);
  });
});



// Get all products with category and subcategory info
app.get('/api/products', (req, res) => {
  const query = `
    SELECT
      p.*,
      c.name as category_name,
      s.name as subcategory_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    ORDER BY p.name
  `;

  db.execute(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(results);
  });
});

// Create a transaction (sale, refund, repair, service, trade_in)
app.post('/api/transactions', (req, res) => {
  const { customer_id, product_id, store_id, transaction_type, quantity = 1, unit_price, total_amount, notes, original_transaction_id } = req.body;

  // For sales, services, and trade-ins, get price from product if not provided
  if ((transaction_type === 'sale' || transaction_type === 'service' || transaction_type === 'trade_in') && product_id && !unit_price) {
    db.execute('SELECT price FROM products WHERE id = ?', [product_id], (err, productResults) => {
      if (err) {
        console.error('Error fetching product:', err);
        return res.status(500).json({ error: 'Failed to fetch product' });
      }

      if (productResults.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const price = productResults[0].price;
      const calculated_total = quantity * price;

      createTransaction({ ...req.body, unit_price: price, total_amount: calculated_total });
    });
  } else {
    createTransaction(req.body);
  }

  function createTransaction(data) {
    const { customer_id, product_id, store_id, transaction_type, quantity = 1, unit_price, total_amount, notes, original_transaction_id } = data;

    const query = `INSERT INTO transactions
      (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, notes, original_transaction_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.execute(query, [customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, notes, original_transaction_id], (err, result) => {
      if (err) {
        console.error('Error inserting transaction:', err);
        return res.status(500).json({ error: 'Failed to create transaction' });
      }

      res.json({
        message: 'Transaction created successfully',
        transactionId: result.insertId,
        transactionType: transaction_type
      });
    });
  }
});

// Get all transactions with full details
app.get('/api/transactions', (req, res) => {
  const query = `
    SELECT
      t.*,
      c.name as customer_name,
      p.name as product_name,
      cat.name as category_name,
      sub.name as subcategory_name,
      s.name as store_name,
      s.location as store_location,
      s.city as store_city,
      s.state as store_state,
      s.zip_code as store_zip_code,
      s.county as store_county,
      s.region as store_region,
      ot.transaction_type as original_transaction_type
    FROM transactions t
    LEFT JOIN customers c ON t.customer_id = c.id
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
    LEFT JOIN stores s ON t.store_id = s.id
    LEFT JOIN transactions ot ON t.original_transaction_id = ot.id
    ORDER BY t.transaction_date DESC
  `;

  db.execute(query, (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    res.json(results);
  });
});

// Backward compatibility - redirect orders to transactions
app.post('/api/orders', (req, res) => {
  req.body.transaction_type = 'sale';
  app._router.handle(req, res, () => {});
});

app.get('/api/orders', (req, res) => {
  // Filter to only show sales for backward compatibility
  const query = `
    SELECT
      t.*,
      c.name as customer_name,
      p.name as product_name,
      cat.name as category_name,
      sub.name as subcategory_name,
      s.name as store_name,
      s.location as store_location
    FROM transactions t
    LEFT JOIN customers c ON t.customer_id = c.id
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
    LEFT JOIN stores s ON t.store_id = s.id
    WHERE t.transaction_type = 'sale'
    ORDER BY t.transaction_date DESC
  `;

  db.execute(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    res.json(results);
  });
});

// ===========================================
// AGGREGATION ENDPOINTS USING STORED PROCEDURES
// ===========================================

// Get overall transaction statistics
app.get('/api/stats/overview', (req, res) => {
  db.execute('CALL GetTransactionStats()', (err, results) => {
    if (err) {
      console.error('Error fetching transaction stats:', err);
      return res.status(500).json({ error: 'Failed to fetch transaction statistics' });
    }
    res.json(results[0][0]); // Stored procedure results are in results[0]
  });
});

// Get transaction type breakdown
app.get('/api/stats/transaction-types', (req, res) => {
  db.execute('CALL GetTransactionTypeStats()', (err, results) => {
    if (err) {
      console.error('Error fetching transaction type stats:', err);
      return res.status(500).json({ error: 'Failed to fetch transaction type statistics' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Get category performance statistics
app.get('/api/stats/categories', (req, res) => {
  db.execute('CALL GetCategoryStats()', (err, results) => {
    if (err) {
      console.error('Error fetching category stats:', err);
      return res.status(500).json({ error: 'Failed to fetch category statistics' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Get subcategory performance statistics
app.get('/api/stats/subcategories', (req, res) => {
  db.execute('CALL GetSubcategoryStats()', (err, results) => {
    if (err) {
      console.error('Error fetching subcategory stats:', err);
      return res.status(500).json({ error: 'Failed to fetch subcategory statistics' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Get store performance statistics
app.get('/api/stats/stores', (req, res) => {
  db.execute('CALL GetStoreStats()', (err, results) => {
    if (err) {
      console.error('Error fetching store stats:', err);
      return res.status(500).json({ error: 'Failed to fetch store statistics' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Get product performance statistics
app.get('/api/stats/products', (req, res) => {
  db.execute('CALL GetProductStats()', (err, results) => {
    if (err) {
      console.error('Error fetching product stats:', err);
      return res.status(500).json({ error: 'Failed to fetch product statistics' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Get customer analytics
app.get('/api/stats/customers', (req, res) => {
  db.execute('CALL GetCustomerStats()', (err, results) => {
    if (err) {
      console.error('Error fetching customer stats:', err);
      return res.status(500).json({ error: 'Failed to fetch customer statistics' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Get daily revenue trends
app.get('/api/stats/daily-revenue', (req, res) => {
  const days = req.query.days || 30;
  db.execute('CALL GetDailyRevenue(?)', [days], (err, results) => {
    if (err) {
      console.error('Error fetching daily revenue:', err);
      return res.status(500).json({ error: 'Failed to fetch daily revenue data' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Get revenue by time period
app.get('/api/stats/revenue-by-period', (req, res) => {
  const period = req.query.period || 'daily'; // hourly, daily, weekly, monthly, yearly
  db.execute('CALL GetRevenueByPeriod(?)', [period], (err, results) => {
    if (err) {
      console.error('Error fetching revenue by period:', err);
      return res.status(500).json({ error: 'Failed to fetch revenue by period data' });
    }
    res.json(results[0]); // Stored procedure results are in results[0]
  });
});

// Backward compatibility endpoint - combines overview and transaction types
app.get('/api/stats/summary', (req, res) => {
  const response = {};

  // Get overview stats
  db.execute('CALL GetTransactionStats()', (err, overviewResults) => {
    if (err) {
      console.error('Error fetching overview stats:', err);
      return res.status(500).json({ error: 'Failed to fetch summary statistics' });
    }

    response.overview = overviewResults[0][0];

    // Get transaction type stats
    db.execute('CALL GetTransactionTypeStats()', (err, typeResults) => {
      if (err) {
        console.error('Error fetching type stats:', err);
        return res.status(500).json({ error: 'Failed to fetch summary statistics' });
      }

      response.transactionTypes = typeResults[0];

      // Get category stats
      db.execute('CALL GetCategoryStats()', (err, categoryResults) => {
        if (err) {
          console.error('Error fetching category stats:', err);
          return res.status(500).json({ error: 'Failed to fetch summary statistics' });
        }

        response.categories = categoryResults[0];
        res.json(response);
      });
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
