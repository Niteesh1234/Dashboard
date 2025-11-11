const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'mysql',
  port: 3306,
  user: 'cdc_user',
  password: 'cdc_password',
  database: 'orders'
};

// Sample data arrays
const customers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Customer IDs
// Generate store IDs from 1 to 56 (all US states now have stores)
const stores = Array.from({length: 56}, (_, i) => i + 1);
const transactionTypes = ['sale', 'refund', 'repair', 'service', 'trade_in'];
const statuses = ['completed', 'pending', 'in_progress', 'declined', 'cancelled'];

// Product mapping by transaction type
const productsByType = {
  sale: [1, 2, 3, 4, 5, 6, 7, 8], // Hardware and services
  refund: [1, 2, 3, 4, 5, 6, 7, 8], // Same as sales
  repair: [13, 14, 15], // Repair products
  service: [9, 10], // Service products
  trade_in: [11, 12] // Trade-in products
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function generateRandomTransaction() {
  const transactionType = getRandomElement(transactionTypes);
  const customerId = getRandomElement(customers);
  const storeId = getRandomElement(stores);
  const status = getRandomElement(statuses);

  let productId = null;
  let unitPrice = null;
  let totalAmount = 0;

  // Set product and pricing based on transaction type
  if (transactionType === 'repair') {
    productId = getRandomElement(productsByType.repair);
    if (productId === 15) { // Free repair
      unitPrice = 0.00;
      totalAmount = 0.00;
    } else {
      unitPrice = getRandomAmount(50, 200);
      totalAmount = unitPrice;
    }
  } else if (transactionType === 'service') {
    productId = getRandomElement(productsByType.service);
    if (productId === 10) { // Free service
      unitPrice = 0.00;
      totalAmount = 0.00;
    } else {
      unitPrice = getRandomAmount(5, 20);
      totalAmount = unitPrice;
    }
  } else if (transactionType === 'trade_in') {
    productId = getRandomElement(productsByType.trade_in);
    unitPrice = getRandomAmount(-800, -200); // Negative for trade-in credits
    totalAmount = unitPrice;
  } else if (transactionType === 'sale' || transactionType === 'refund') {
    productId = getRandomElement(productsByType.sale);
    // Get the actual product price from database
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute('SELECT price FROM products WHERE id = ?', [productId]);
      await connection.end();

      if (rows.length > 0) {
        const basePrice = parseFloat(rows[0].price);
        unitPrice = basePrice;
        totalAmount = transactionType === 'refund' ? -basePrice : basePrice;
      }
    } catch (error) {
      console.error('Error fetching product price:', error);
      unitPrice = getRandomAmount(10, 2000);
      totalAmount = transactionType === 'refund' ? -unitPrice : unitPrice;
    }
  }

  // Generate notes based on transaction type
  let notes = '';
  switch (transactionType) {
    case 'sale':
      notes = `Product purchase - ${getRandomElement(['Online', 'In-store', 'Phone order'])}`;
      break;
    case 'refund':
      notes = `Refund - ${getRandomElement(['Customer request', 'Defective product', 'Wrong item'])}`;
      break;
    case 'repair':
      notes = `Device repair - ${getRandomElement(['Screen replacement', 'Battery service', 'Warranty repair'])}`;
      break;
    case 'service':
      notes = `Service setup - ${getRandomElement(['Apple Music', 'Apple Pay', 'iCloud'])}`;
      break;
    case 'trade_in':
      notes = `Trade-in credit - ${getRandomElement(['iPhone', 'iPad', 'MacBook'])}`;
      break;
  }

  return {
    customer_id: customerId,
    product_id: productId,
    store_id: storeId,
    transaction_type: transactionType,
    quantity: 1,
    unit_price: unitPrice,
    total_amount: totalAmount,
    status: status,
    notes: notes
  };
}

async function insertRandomTransaction() {
  try {
    const transaction = await generateRandomTransaction();
    const connection = await mysql.createConnection(dbConfig);

    const query = `INSERT INTO transactions
      (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await connection.execute(query, [
      transaction.customer_id,
      transaction.product_id,
      transaction.store_id,
      transaction.transaction_type,
      transaction.quantity,
      transaction.unit_price,
      transaction.total_amount,
      transaction.status,
      transaction.notes
    ]);

    await connection.end();

    console.log(`Generated transaction ID ${result.insertId}: ${transaction.transaction_type} - $${transaction.total_amount} - ${transaction.status}`);

  } catch (error) {
    console.error('Error inserting random transaction:', error);
  }
}

// Generate a transaction every 5 seconds
console.log('Starting random transaction generator...');
setInterval(insertRandomTransaction, 5000);

// Generate initial transaction
insertRandomTransaction();
