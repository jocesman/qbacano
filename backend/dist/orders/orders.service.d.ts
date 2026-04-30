import { PrismaService } from '../prisma/prisma.service';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(userId: string): Promise<{
        user: {
            name: string;
            phone: string | null;
        };
        items: {
            id: string;
            productId: string;
            quantity: number;
            productName: string;
            unitPriceAtMoment: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getUserOrders(userId: string): Promise<({
        items: {
            id: string;
            productId: string;
            quantity: number;
            productName: string;
            unitPriceAtMoment: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getOrderById(orderId: string, userId: string): Promise<{
        user: {
            name: string;
            phone: string | null;
        };
        items: {
            id: string;
            productId: string;
            quantity: number;
            productName: string;
            unitPriceAtMoment: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    generateWhatsAppLink(order: any): string;
    updateStatusToSent(orderId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
}
