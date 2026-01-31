#!/bin/bash
# NUFI API Testing GUI - Quick Setup Script

echo "🚀 NUFI API Testing GUI Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your NUFI API credentials:"
    echo "   - NUFI_API_KEY=your_api_key_here"
    echo "   - NUFI_API_SECRET=your_api_secret_here"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "Installing root dependencies..."
npm install

echo ""
echo "Installing server dependencies..."
cd server && npm install && cd ..

echo ""
echo "Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Edit .env and add your NUFI API credentials"
echo "   2. Run: npm run dev"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 See README.md for detailed instructions"
echo ""
