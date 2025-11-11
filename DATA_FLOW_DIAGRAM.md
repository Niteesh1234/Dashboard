# Real-Time Transaction Sync Data Flow Diagram

## System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Generator │    │      MySQL      │    │    Debezium     │
│                 │    │   (Primary DB)  │    │   (CDC Engine)  │
│  • Generates    │───▶│  • transactions │───▶│  • Captures     │
│    random       │    │    table        │    │    changes      │
│    transactions │    │  • BINLOG       │    │  • Converts to  │
│    every 5s     │    │    events       │    │    events       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Kafka       │    │  CDC Consumer   │    │    MongoDB      │
│   (Message      │    │                 │    │  (Cache DB)     │
│    Broker)      │    │  • Subscribes   │    │                 │
│                 │    │    to topics    │    │  • Stores       │
│  • dbserver1.   │───▶│  • Processes    │───▶│    enriched     │
│    orders.      │    │    events       │    │    transactions │
│    transactions │    │  • Joins data   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      API        │    │   Dashboard     │    │   Web Browser   │
│   (REST API)    │    │   (Express.js)  │    │                 │
│                 │    │                 │    │  • Real-time    │
│  • /api/        │───▶│  • Fetches from │───▶│    updates      │
│    transactions │    │    MongoDB      │    │  • Shows live   │
│  • /api/orders  │    │  • Renders EJS  │    │    data         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Detailed Data Flow Steps

### 1. Data Generation Phase
```
Data Generator Service
├── Generates random transaction data
├── Inserts into MySQL transactions table
└── Repeats every 5 seconds
```

### 2. Change Data Capture (CDC) Phase
```
MySQL BINLOG → Debezium → Kafka Topic
├── MySQL writes transaction to binlog
├── Debezium detects INSERT/UPDATE/DELETE
├── Converts to Kafka message format
└── Publishes to "dbserver1.orders.transactions" topic
```

### 3. Data Processing Phase
```
Kafka → CDC Consumer → MongoDB
├── Consumer subscribes to Kafka topic
├── Receives transaction events
├── Queries MySQL for joined data (customer, product, store info)
├── Enriches transaction with related data
└── Upserts enriched document to MongoDB transactions collection
```

### 4. API Serving Phase
```
MongoDB → API → JSON Response
├── API receives GET /api/transactions request
├── Queries MongoDB for all transactions
├── Formats data with proper relationships
└── Returns JSON array of enriched transactions
```

### 5. Dashboard Display Phase
```
API → Dashboard → WebSocket Updates
├── Dashboard fetches data from API every 5 seconds
├── Renders EJS template with transaction data
├── Shows statistics and breakdowns
├── Highlights new transactions with animations
└── Updates counters and charts in real-time
```

## Component Interactions

### Synchronous Flows:
- Data Generator → MySQL (INSERT)
- API → MongoDB (SELECT)
- Dashboard → API (HTTP GET)

### Asynchronous Flows:
- MySQL → Debezium → Kafka (Event Streaming)
- Kafka → CDC Consumer → MongoDB (Event Processing)

### Real-time Updates:
- Dashboard polls API every 5 seconds
- New transactions appear at top of table
- Statistics update automatically
- Status indicators change colors

## Data Transformation Pipeline

```
Raw Transaction Data
     ↓
MySQL Storage (Normalized)
     ↓
CDC Event Capture
     ↓
Kafka Message (JSON)
     ↓
Consumer Processing (Data Enrichment)
     ↓
MongoDB Document (Denormalized)
     ↓
API Response (JSON)
     ↓
Dashboard Display (HTML/EJS)
     ↓
User Interface (Real-time Updates)
```

## Key Technologies Used

- **MySQL**: Primary transactional database
- **Debezium**: Change data capture for MySQL
- **Kafka**: Message broker for event streaming
- **Node.js**: CDC consumer and API server
- **MongoDB**: Cache database for fast reads
- **Express.js**: Web framework for dashboard
- **EJS**: Template engine for dashboard
- **Docker**: Container orchestration
- **Docker Compose**: Multi-service management

## Monitoring Points

- **Data Generator Logs**: Transaction creation confirmations
- **Debezium Logs**: CDC event processing
- **CDC Consumer Logs**: Data enrichment and MongoDB writes
- **API Logs**: Request/response handling
- **Dashboard Logs**: Data fetching and rendering

This architecture ensures real-time synchronization with sub-second latency from database change to dashboard update.
