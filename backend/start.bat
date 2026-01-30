@echo off
echo ========================================
echo   Brainexia Backend Setup & Start
echo ========================================
echo.

echo [1/3] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✓ Prisma client generated successfully
echo.

echo [2/3] Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo WARNING: Migration failed, but continuing...
)
echo.

echo [3/3] Starting server...
echo.
call pnpm run dev
