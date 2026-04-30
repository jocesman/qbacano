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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StoresService = class StoresService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.store.create({ data: dto });
    }
    async findAll() {
        return this.prisma.store.findMany({ include: { products: { where: { active: true } } } });
    }
    async findOne(id) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            include: { products: { where: { active: true } } }
        });
        if (!store)
            throw new common_1.NotFoundException('Tienda no encontrada');
        return store;
    }
    async update(id, dto) {
        const store = await this.prisma.store.findUnique({ where: { id } });
        if (!store)
            throw new common_1.NotFoundException('Tienda no encontrada');
        return this.prisma.store.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const store = await this.prisma.store.findUnique({ where: { id } });
        if (!store)
            throw new common_1.NotFoundException('Tienda no encontrada');
        return this.prisma.store.delete({ where: { id } });
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoresService);
//# sourceMappingURL=stores.service.js.map