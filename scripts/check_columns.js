const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const res = await p.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('Classes','classes');`;
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();
