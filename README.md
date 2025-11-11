# Real-Time CDC Dashboard

A complete end-to-end real-time Change Data Capture (CDC) dashboard that streams data from MySQL to MongoDB via Apache Kafka and Debezium.

## Architecture

- **MySQL**: Source database with orders table
- **Debezium**: Captures MySQL binlog changes and streams to Kafka
- **Kafka**: Message broker for CDC events
- **Node.js Consumer**: Processes Kafka messages and syncs to MongoDB
- **MongoDB**: Target database for real-time dashboard
- **Express API**: REST API for order management
- **Express Dashboard**: Web interface showing real-time order data

## Quick Start

1. **Start everything with Docker**:
   ```bash
   docker compose up --build
   ```

2. **Open the dashboard**:
   - Dashboard: http://localhost:3001
   - API: http://localhost:3000

3. **Test real-time updates**:
   ```bash
   ./insert-order.sh "John Doe" "iPhone 15" 1 999.99
   ```

   Watch the dashboard update automatically within 5-10 seconds!

## Manual Testing

If you want to test manually:

```bash
docker compose exec mysql mysql -ucdc_user -pcdc_password orders -e \
"INSERT INTO orders (customer_name, product_name, quantity, price, total_amount) VALUES ('TestUser','TestProduct',1,100.00,100.00);"
```

## Services

- **MySQL**: Port 3306
- **MongoDB**: Port 27017
- **Kafka**: Port 9092
- **Zookeeper**: Port 2181
- **Debezium**: Port 8083
- **API**: Port 3000
- **Dashboard**: Port 3001

## Files

- `docker-compose.yml`: Complete Docker setup with all services
- `api/`: REST API for orders
- `dashboard/`: Web dashboard
- `insert-order.sh`: Helper script for testing
- `register-connector.sh`: Auto-registers Debezium connector

## Troubleshooting

1. **Check service status**:
   ```bash
   docker compose ps
   ```

2. **View logs**:
   ```bash
   docker compose logs -f [service-name]
   ```

3. **Reset consumer offsets** (if needed):
   ```bash
   docker compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --group cdc-group-new --reset-offsets --to-earliest --topic dbserver1.orders.orders --execute
   ```

The system provides true real-time visibility of the CDC pipeline operation!
