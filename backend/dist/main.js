"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const prisma = app.get(prisma_service_1.PrismaService);
    app.useGlobalInterceptors(new audit_interceptor_1.AuditInterceptor(prisma));
    await app.listen(process.env.PORT ?? 3001);
    console.log(`🚀 Backend corriendo en http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map