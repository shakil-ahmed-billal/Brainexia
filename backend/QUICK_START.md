# Quick Start - Fix All Errors

## The Error
```
Error: Cannot find module '.prisma/client/default'
```

This means **Prisma client hasn't been generated yet**.

## Solution - Run These Commands:

```bash
cd backend

# Step 1: Generate Prisma Client (REQUIRED!)
npx prisma generate

# Step 2: Run migrations (optional, but recommended)
npx prisma migrate dev --name init

# Step 3: Start server
pnpm run dev
```

## Or Use the Batch Script (Windows):

```bash
cd backend
start.bat
```

This will automatically:
1. Generate Prisma client
2. Run migrations
3. Start the server

## Why This Happens

Prisma needs to generate TypeScript types and client code from your schema. This is done with `npx prisma generate`. Without this step, the `@prisma/client` module doesn't exist yet.

After running `npx prisma generate`, the `.prisma/client` folder will be created in `node_modules`, and your server will start successfully.
