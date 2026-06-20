#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║  🏨 Luxe Grand Hotel — Project Setup      ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Copy .env files
echo "📄 Setting up environment files..."
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
echo "✅ .env files created (edit them with your API keys)"

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
echo "✅ Frontend dependencies installed"

echo ""
echo "📦 Installing backend dependencies..."
cd ../backend && npm install
echo "✅ Backend dependencies installed"

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                       ║"
echo "║                                           ║"
echo "║  To start frontend:                       ║"
echo "║    cd frontend && npm run dev             ║"
echo "║                                           ║"
echo "║  To start backend:                        ║"
echo "║    cd backend && npm run dev              ║"
echo "║                                           ║"
echo "║  Now run Claude Code in this folder:      ║"
echo "║    claude                                 ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
