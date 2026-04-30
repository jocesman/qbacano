"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDailySales() {
        return this.prisma.$queryRaw `
      SELECT DATE(o."createdAt") AS day, COUNT(*) AS total_orders, SUM(o."totalAmount") AS revenue
      FROM "Order" o
      WHERE o.status = 'SENT_VIA_WHATSAPP' AND o."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY day ORDER BY day DESC
    `;
    }
    async getTopProducts() {
        return this.prisma.$queryRaw `
      SELECT oi."productName", SUM(oi.quantity) AS total_sold, SUM(oi.subtotal) AS revenue
      FROM "OrderItem" oi JOIN "Order" o ON oi."orderId" = o.id
      WHERE o.status = 'SENT_VIA_WHATSAPP'
      GROUP BY oi."productName" ORDER BY total_sold DESC LIMIT 5
    `;
    }
    async getMonthlyRevenue() {
        return this.prisma.$queryRaw `
      SELECT TO_CHAR(o."createdAt", 'YYYY-MM') AS month, COUNT(*) AS orders, SUM(o."totalAmount") AS revenue
      FROM "Order" o
      WHERE o.status = 'SENT_VIA_WHATSAPP' AND EXTRACT(YEAR FROM o."createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month ORDER BY month
    `;
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map