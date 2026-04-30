import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<{
        total: number;
        items: ({
            product: {
                store: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    whatsapp: string;
                };
            } & {
                name: string;
                id: string;
                createdAt: Date;
                active: boolean;
                storeId: string;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            cartId: string;
        })[];
        id: string;
        userId: string;
    }>;
    addToCart(userId: string, dto: AddToCartDto): Promise<{
        id: string;
        productId: string;
        quantity: number;
        cartId: string;
    }>;
    removeFromCart(userId: string, productId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    clearCart(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
