#!/bin/bash

if [ $# -lt 5 ]; then
    echo "Usage: $0 <transaction_type> <customer_id> <product_id> <store_id> <quantity>"
    echo "Example: $0 sale 1 1 1 2"
    echo ""
    echo "Transaction Types: sale, refund, repair, service, trade_in"
    echo ""
    echo "Available options:"
    echo "Customer IDs: 1=John Doe, 2=Jane Smith, 3=Bob Johnson"
    echo "Store IDs: 1=Apple Store Downtown, 2=Apple Store Mall, 3=Apple Store Airport"
    echo "Product IDs:"
    echo "  1=iPhone 15 (Hardware/iPhones)"
    echo "  2=MacBook Pro (Hardware/Macs)"
    echo "  3=iPad Air (Hardware/iPads)"
    echo "  4=Apple Watch Series 9 (Hardware/Apple Watch)"
    echo "  5=Apple TV 4K (Hardware/Apple TV)"
    echo "  6=USB-C Charger (Hardware/Chargers)"
    echo "  7=AirPods Pro (Hardware/Others)"
    echo "  8=AppleCare+ for iPhone (Services/AppleCare+)"
    echo "  9=Apple Music Subscription (Services/Subscriptions)"
    echo "  10=Apple Pay Setup (Services/Apple Pay)"
    echo "  11=iPhone Trade-in (Trade-Ins/old)"
    echo "  12=Screen Repair (Repairs/Paid)"
    echo ""
    echo "For repairs, use product IDs:"
    echo "  13=iPhone Screen Repair (Repairs/Paid)"
    echo "  14=MacBook Battery Replacement (Repairs/Paid)"
    echo "  15=iPad Warranty Repair (Repairs/Free)"
    exit 1
fi

TRANSACTION_TYPE="$1"
CUSTOMER_ID="$2"
PRODUCT_ID="$3"
STORE_ID="$4"
QUANTITY="$5"

echo "Creating transaction: Type $TRANSACTION_TYPE, Customer ID $CUSTOMER_ID, Product ID $PRODUCT_ID, Store ID $STORE_ID, Quantity $QUANTITY"

# Handle null product_id for repairs
if [ "$PRODUCT_ID" = "null" ]; then
    PRODUCT_PARAM="null"
else
    PRODUCT_PARAM="$PRODUCT_ID"
fi

# Use the API to create the transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"transaction_type\": \"$TRANSACTION_TYPE\", \"customer_id\": $CUSTOMER_ID, \"product_id\": $PRODUCT_PARAM, \"store_id\": $STORE_ID, \"quantity\": $QUANTITY}"

echo ""
echo "Transaction created! Check the dashboard at http://localhost:3001"
