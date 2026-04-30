import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDailySales() {
    return this.prisma.$queryRaw`
      SELECT DATE(o."createdAt") AS day, COUNT(*) AS total_orders, SUM(o."totalAmount") AS revenue
      FROM "Order" o
      WHERE o.status = 'SENT_VIA_WHATSAPP' AND o."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY day ORDER BY day DESC
    `;
  }

  async getTopProducts() {
    return this.prisma.$queryRaw`
      SELECT oi."productName", SUM(oi.quantity) AS total_sold, SUM(oi.subtotal) AS revenue
      FROM "OrderItem" oi JOIN "Order" o ON oi."orderId" = o.id
      WHERE o.status = 'SENT_VIA_WHATSAPP'
      GROUP BY oi."productName" ORDER BY total_sold DESC LIMIT 5
    `;
  }

  async getMonthlyRevenue() {
    return this.prisma.$queryRaw`
      SELECT TO_CHAR(o."createdAt", 'YYYY-MM') AS month, COUNT(*) AS orders, SUM(o."totalAmount") AS revenue
      FROM "Order" o
      WHERE o.status = 'SENT_VIA_WHATSAPP' AND EXTRACT(YEAR FROM o."createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month ORDER BY month
    `;
  }
}
