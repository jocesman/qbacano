import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    findAll(): Promise<({
        products: {
            name: string;
            id: string;
            createdAt: Date;
            active: boolean;
            storeId: string;
            price: import("@prisma/client/runtime/library").Decimal;
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
            storeId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string;
    }>;
    create(dto: CreateStoreDto): Promise<{
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
