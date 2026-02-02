@echo off
echo   - Running Prisma DB push...
npx prisma db push --force-reset --accept-data-loss && echo   - Running seed... && npx tsx prisma/seed.ts && echo   - Database initialized!
pause