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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(userId) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });
        if (!cart || cart.items.length === 0) {
            throw new common_1.BadRequestException('El carrito está vacío');
        }
        return this.prisma.$transaction(async (tx) => {
            const orderItemsData = cart.items.map(item => {
                const unitPrice = item.product.price.toNumber();
                const subtotal = unitPrice * item.quantity;
                return {
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPriceAtMoment: unitPrice,
                    subtotal,
                };
            });
            const totalAmount = orderItemsData.reduce((sum, i) => sum + i.subtotal, 0);
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    status: 'GENERATED',
                    totalAmount,
                    items: { create: orderItemsData }
                },
                include: {
                    items: true,
                    user: { select: { name: true, phone: true } }
                }
            });
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return newOrder;
        });
    }
    async getUserOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getOrderById(orderId, userId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: true,
                user: { select: { name: true, phone: true } }
            }
        });
        if (!order)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return order;
    }
    generateWhatsAppLink(order) {
        const phone = process.env.DEFAULT_WHATSAPP_PHONE || order.user?.phone || '';
        let text = `🛒 *Nuevo Pedido Qbacano*\n\n`;
        text += `👤 Cliente: ${order.user.name}\n`;
        text += `📦 Productos:\n`;
        order.items.forEach((item, i) => {
            text += `${i + 1}. ${item.productName} x${item.quantity} - $${Number(item.subtotal).toLocaleString()}\n`;
        });
        text += `\n💰 *Total: $${Number(order.totalAmount).toLocaleString()}*\n`;
        text += `🆔 ID: ${order.id}`;
        return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    }
    async updateStatusToSent(orderId, userId) {
        return this.prisma.order.update({
            where: { id: orderId, userId },
            data: { status: 'SENT_VIA_WHATSAPP' }
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map