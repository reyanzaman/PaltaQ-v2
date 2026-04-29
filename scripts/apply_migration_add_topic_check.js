const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const p = new PrismaClient();
  try {
    const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', '20260429175603_add_topic_check', 'migration.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error('Migration SQL file not found:', migrationPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    // Split on semicolons that are followed by newline (very basic)
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      console.log('Executing statement:', stmt.split('\n')[0].slice(0,200));
      try {
        await p.$executeRawUnsafe(stmt + ';');
        console.log('Executed successfully');
      } catch (e) {
        console.error('Statement failed:', e.message || e);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();
