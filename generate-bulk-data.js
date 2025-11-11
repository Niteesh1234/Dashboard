const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'mysql',
  port: 3306,
  user: 'cdc_user',
  password: 'cdc_password',
  database: 'orders'
};

// Sample data arrays
const customers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const transactionTypes = ['sale', 'refund', 'repair', 'service', 'trade_in'];
const statuses = ['completed', 'pending', 'in_progress', 'declined', 'cancelled'];

const productsByType = {
  sale: [1, 2, 3, 4, 5, 6, 7, 8],
  refund: [1, 2, 3, 4, 5, 6, 7, 8],
  repair: [12], // Screen Repair (ID 12)
  service: [9, 10], // Apple Music and Apple Pay Setup
  trade_in: [11] // iPhone Trade-in
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function generateTransactionForStore(storeId) {
  const transactionType = getRandomElement(['sale', 'sale', 'sale', 'service', 'repair']); // Bias towards sales
  const customerId = getRandomElement(customers);
  const status = 'completed'; // Only completed transactions for the map

  let productId = null;
  let unitPrice = null;
  let totalAmount = 0;

  if (transactionType === 'repair') {
    productId = getRandomElement(productsByType.repair);
    unitPrice = productId === 15 ? 0.00 : getRandomAmount(50, 200);
    totalAmount = unitPrice;
  } else if (transactionType === 'service') {
    productId = getRandomElement(productsByType.service);
    unitPrice = productId === 10 ? 0.00 : getRandomAmount(5, 20);
    totalAmount = unitPrice;
  } else if (transactionType === 'trade_in') {
    productId = getRandomElement(productsByType.trade_in);
    unitPrice = getRandomAmount(-800, -200);
    totalAmount = unitPrice;
  } else if (transactionType === 'sale' || transactionType === 'refund') {
    productId = getRandomElement(productsByType.sale);
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
      unitPrice = getRandomAmount(100, 2000);
      totalAmount = transactionType === 'refund' ? -unitPrice : unitPrice;
    }
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
    notes: `${transactionType} transaction`
  };
}

async function generateBulkTransactions() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Get all store IDs
    const [stores] = await connection.execute('SELECT id FROM stores ORDER BY id');
    console.log(`Found ${stores.length} stores`);

    // Generate 5-15 transactions per store
    for (const store of stores) {
      const numTransactions = Math.floor(Math.random() * 11) + 5; // 5-15 transactions

      for (let i = 0; i < numTransactions; i++) {
        const transaction = await generateTransactionForStore(store.id);

        const query = `INSERT INTO transactions
          (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await connection.execute(query, [
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

        console.log(`Generated transaction for store ${store.id}: ${transaction.transaction_type} - $${transaction.total_amount}`);
      }
    }

    console.log('Bulk transaction generation completed!');

  } catch (error) {
    console.error('Error generating bulk transactions:', error);
  } finally {
    await connection.end();
  }
}

generateBulkTransactions();
