#!/bin/sh

# Wait for Debezium to be ready
echo "Waiting for Debezium to be ready..."
while ! curl -f http://debezium:8083/connectors 2>/dev/null; do
  echo "Waiting for Debezium..."
  sleep 5
done

echo "Registering MySQL connector..."
curl -X POST -H "Content-Type: application/json" \
  -d @/app/register-mysql-connector.json \
  http://debezium:8083/connectors

echo "Connector registered successfully!"
