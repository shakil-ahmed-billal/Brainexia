# Setup Instructions

## Fix All Errors and Run the Project

### Step 1: Install Dependencies

```bash
# Backend
cd backend
pnpm install
pnpm add @prisma/adapter-pg pg
pnpm add -D @types/pg

# Frontend  
cd ../frontend
pnpm install
```

### Step 2: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

This will create the Prisma client in `backend/generated/prisma/`

### Step 3: Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

### Step 4: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
pnpm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Prisma Studio: `cd backend && npx prisma studio`

## Important Notes

1. **Prisma 7 Changes**: The `url` property has been removed from `schema.prisma` and moved to `prisma.config.ts`
2. **Database Connection**: Make sure your `DATABASE_URL` in `backend/.env` is correct
3. **Prisma Client**: The client is generated to `backend/generated/prisma/` as specified in the schema

## Troubleshooting

If you get "Cannot find module '../generated/prisma'":
1. Run `npx prisma generate` in the backend directory
2. Make sure the `generated/prisma` folder exists

If you get Prisma migration errors:
1. Make sure `DATABASE_URL` is set in `backend/.env`
2. Make sure your PostgreSQL database is running
3. Check that the connection string format is correct
