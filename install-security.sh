#!/bin/bash

echo "🔒 Installing Booth 33 Security Dependencies..."
echo ""

# Check if npm or yarn
if command -v yarn &> /dev/null; then
    PKG_MANAGER="yarn add"
    PKG_MANAGER_DEV="yarn add --dev"
else
    PKG_MANAGER="npm install"
    PKG_MANAGER_DEV="npm install --save-dev"
fi

echo "Using package manager: $PKG_MANAGER"
echo ""

# Install core security dependencies
echo "📦 Installing core security packages..."
$PKG_MANAGER react-native-dotenv
$PKG_MANAGER react-native-keychain
$PKG_MANAGER react-native-encrypted-storage
$PKG_MANAGER @stripe/stripe-react-native

echo ""
echo "📦 Installing development tools..."
$PKG_MANAGER_DEV eslint prettier eslint-plugin-react eslint-plugin-react-native

echo ""
echo "📋 Setting up environment files..."

# Create .env from .env.example if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
        echo "⚠️  Please edit .env and add your actual API keys!"
    else
        echo "⚠️  .env.example not found"
    fi
else
    echo "✅ .env already exists"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys"
echo "2. Restart Metro bundler: npm start -- --clear"
echo "3. Read SECURITY.md for security best practices"
echo "4. Read SETUP.md for detailed setup instructions"
echo ""
echo "Happy coding! 🚀"
