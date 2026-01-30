@echo off
echo 🚀 Setting up Brainexia Backend...

REM Install dependencies
echo 📦 Installing dependencies...
call pnpm install

REM Add required packages
echo 📦 Adding Prisma adapter and pg...
call pnpm add @prisma/adapter-pg pg
call pnpm add -D @types/pg

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

REM Run migrations
echo 🗄️  Running database migrations...
call npx prisma migrate dev --name init

echo ✅ Setup complete! Run 'pnpm run dev' to start the server.
pause
