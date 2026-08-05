const { execSync } = require('child_process');
const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

if (!url) {
  console.warn("⚠️ Warning: No database connection URL found (DATABASE_URL or POSTGRES_PRISMA_URL). Skipping database schema migration.");
  process.exit(0);
}

console.log("Database connection found. Running Prisma DB Push to automatically update the database...");
try {
  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit'
  });
  console.log("✅ Database schema updated successfully.");
} catch (err) {
  console.error("❌ Database update failed:", err.message);
  process.exit(1);
}
