import { PrismaService } from '../prisma/prisma.service';
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDailySales(): Promise<unknown>;
    getTopProducts(): Promise<unknown>;
    getMonthlyRevenue(): Promise<unknown>;
}
