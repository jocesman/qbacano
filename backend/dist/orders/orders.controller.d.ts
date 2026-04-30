import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: any): Promise<{
        order: {
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
        };
        whatsappLink: string;
    }>;
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    getWhatsAppLink(id: string, req: any): Promise<{
        url: string;
    }>;
    markAsSent(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
}
