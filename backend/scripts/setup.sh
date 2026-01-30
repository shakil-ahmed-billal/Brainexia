#!/bin/bash

echo "🚀 Setting up Brainexia Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Add required packages
echo "📦 Adding Prisma adapter and pg..."
pnpm add @prisma/adapter-pg pg
pnpm add -D @types/pg

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

echo "✅ Setup complete! Run 'pnpm run dev' to start the server."
