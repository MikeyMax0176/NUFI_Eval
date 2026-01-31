#!/bin/bash

# NUFI API Configuration Helper
# This script helps you configure the correct API endpoint

echo "🔧 NUFI API Configuration Helper"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
fi

echo "📋 Current Configuration:"
echo "------------------------"
grep -E "NUFI_API_KEY|NUFI_API_SECRET|NUFI_API_BASE_URL" .env 2>/dev/null || echo "No NUFI configuration found"
echo ""

echo "❓ Common NUFI API Base URLs to try:"
echo "   1. https://api.nufi.com.mx"
echo "   2. https://nufi.mx/api/v1"
echo "   3. https://api-prod.nufi.mx"
echo "   4. https://services.nufi.com.mx"
echo ""

echo "📝 To update the API base URL:"
echo "   1. Open the .env file"
echo "   2. Add or update this line:"
echo "      NUFI_API_BASE_URL=https://[correct-url]"
echo "   3. Restart the server: npm run server"
echo ""

echo "🧪 To test if a URL works:"
echo "   curl -I https://[url-to-test]"
echo ""

echo "📧 Check your NUFI email for:"
echo "   ✓ API Base URL / Endpoint"
echo "   ✓ Example API calls"
echo "   ✓ Authentication details"
echo ""

read -p "Would you like to test a specific API URL? (y/n): " test_url

if [ "$test_url" = "y" ] || [ "$test_url" = "Y" ]; then
    read -p "Enter the API URL to test (e.g., https://api.nufi.com.mx): " url
    echo ""
    echo "Testing $url..."
    curl -I -m 5 "$url" 2>&1 | head -5
    echo ""
    
    if [ $? -eq 0 ]; then
        echo "✅ URL is reachable!"
        read -p "Would you like to update .env with this URL? (y/n): " update
        if [ "$update" = "y" ] || [ "$update" = "Y" ]; then
            # Add or update NUFI_API_BASE_URL in .env
            if grep -q "NUFI_API_BASE_URL" .env; then
                sed -i "s|NUFI_API_BASE_URL=.*|NUFI_API_BASE_URL=$url|" .env
            else
                echo "NUFI_API_BASE_URL=$url" >> .env
            fi
            echo "✅ Updated .env with new base URL"
            echo "⚠️  Remember to restart the server: npm run server"
        fi
    else
        echo "❌ URL is not reachable. Please verify the correct URL from NUFI documentation."
    fi
fi

echo ""
echo "Done! Check API_ENDPOINT_ISSUE.md for more detailed troubleshooting."
