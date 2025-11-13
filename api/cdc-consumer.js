const { Kafka } = require('kafkajs');
const { MongoClient } = require('mongodb');

const kafka = new Kafka({
  clientId: 'cdc-consumer',
  brokers: ['kafka:29092']
});

const consumer = kafka.consumer({ groupId: 'cdc-group-new' });

const mongoClient = new MongoClient('mongodb://admin:password@mongodb:27017/?authSource=admin');

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'dbserver1.orders.transactions', fromBeginning: true });

  await mongoClient.connect();
  const db = mongoClient.db('orders_db');
  const collection = db.collection('transactions');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log('Received message from topic:', topic);
        const rawMessage = message.value.toString();
        console.log('Raw message length:', rawMessage.length);
        const event = JSON.parse(rawMessage);
        console.log('Parsed event keys:', Object.keys(event));
        console.log('Payload keys:', Object.keys(event.payload));
        console.log('Event operation:', event.payload.__op, 'ID:', event.payload.id);

        // Handle Debezium messages with schema and payload
        const payload = event.payload;
        if (payload.__op === 'c' || payload.__op === 'u' || payload.__op === 'r') { // create, update, or read (from snapshot)
          // Handle byte-encoded decimal fields
          const unitPrice = Array.isArray(payload.unit_price) ? parseFloat(Buffer.from(payload.unit_price).toString()) : parseFloat(payload.unit_price);
          const totalAmount = Array.isArray(payload.total_amount) ? parseFloat(Buffer.from(payload.total_amount).toString()) : parseFloat(payload.total_amount);

          // Fetch joined data from MySQL
          const mysql = require('mysql2/promise');
          const mysqlConnection = await mysql.createConnection({
            host: 'mysql',
            port: 3306,
            user: 'cdc_user',
            password: 'cdc_password',
            database: 'orders'
          });

          const [rows] = await mysqlConnection.execute(`
            SELECT
              t.*,
              c.name as customer_name,
              p.name as product_name,
              cat.name as category_name,
              sub.name as subcategory_name,
              s.name as store_name,
              s.location as store_location,
              ot.transaction_type as original_transaction_type
            FROM transactions t
            LEFT JOIN customers c ON t.customer_id = c.id
            LEFT JOIN products p ON t.product_id = p.id
            LEFT JOIN categories cat ON p.category_id = cat.id
            LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
            LEFT JOIN stores s ON t.store_id = s.id
            LEFT JOIN transactions ot ON t.original_transaction_id = ot.id
            WHERE t.id = ?
          `, [payload.id]);

          await mysqlConnection.end();

          if (rows.length > 0) {
            const transaction = rows[0];
            transaction.unit_price = unitPrice;
            transaction.total_amount = totalAmount;
            transaction.transaction_date = new Date(transaction.transaction_date);

            console.log('Inserting transaction:', transaction.id, transaction.transaction_type);
            const result = await collection.updateOne(
              { id: transaction.id },
              { $set: transaction },
              { upsert: true }
            );
            console.log('MongoDB result:', result);

            console.log('Synced transaction:', transaction.id);
          }
        } else if (payload.__op === 'd') { // delete
          await collection.deleteOne({ id: payload.id });
          console.log('Deleted order:', payload.id);
        } else {
          console.log('Unknown operation:', event.__op);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    },
  });
}

run().catch(console.error);
