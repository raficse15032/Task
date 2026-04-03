#!/bin/bash

echo "Testing Rate Limiting - 5 requests per minute allowed"
echo "=================================================="

for i in {1..7}; do
    echo -n "Request $i: "
    response=$(curl -s -w "\nStatus: %{http_code}" -X POST http://localhost:8830/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d '{"email":"test@test.com","password":"wrong"}' 2>&1)
    
    status=$(echo "$response" | grep "Status:" | cut -d' ' -f2)
    
    if [ "$status" == "429" ]; then
        echo "⛔ RATE LIMITED (429 Too Many Requests)"
    elif [ "$status" == "422" ] || [ "$status" == "401" ]; then
        echo "✓ Request allowed (Status: $status)"
    else
        echo "Status: $status"
    fi
    
    sleep 0.2
done

echo ""
echo "✅ If you see 429 status after 5 requests, rate limiting is working!"
