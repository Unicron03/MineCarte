@echo off
echo   - Running Prisma DB push...
npx prisma db push --force-reset --accept-data-loss && ^
echo   - Generating Prisma client... && ^
npx prisma generate && ^
echo   - Running seed... && ^
npx tsx prisma/seed.ts && ^
echo   - Running test seed... && ^
npx tsx prisma/seedTest.ts && ^
echo   - Database initialized!
pause