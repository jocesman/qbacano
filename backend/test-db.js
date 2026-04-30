const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    const tables =
      await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(
      '📦 Tablas creadas:',
      tables.map((t) => t.table_name).join(', '),
    );
    await prisma.$disconnect();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
