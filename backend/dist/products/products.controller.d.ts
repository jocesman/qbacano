import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(storeId?: string): Promise<({
        store: {
            name: string;
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
    })[]>;
    findOne(id: string): Promise<{
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
    }>;
    create(dto: CreateProductDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        active: boolean;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        active: boolean;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        active: boolean;
        storeId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }>;
}
