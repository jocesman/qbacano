import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateStoreDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string;
    }>;
    findAll(): Promise<({
        products: {
            name: string;
            id: string;
            createdAt: Date;
            active: boolean;
            price: import("@prisma/client/runtime/library").Decimal;
            storeId: string;
            stock: number;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string;
    })[]>;
    findOne(id: string): Promise<{
        products: {
            name: string;
            id: string;
            createdAt: Date;
            active: boolean;
            price: import("@prisma/client/runtime/library").Decimal;
            storeId: string;
            stock: number;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string;
    }>;
    update(id: string, dto: UpdateStoreDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string;
    }>;
}
