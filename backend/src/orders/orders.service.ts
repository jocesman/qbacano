import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Construir items con precios CONGELADOS
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

      // 2. Calcular total
      const totalAmount = orderItemsData.reduce((sum, i) => sum + i.subtotal, 0);

      // 3. Crear pedido + items
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

      // 4. Vaciar carrito
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { 
        items: true, 
        user: { select: { name: true, phone: true } }
      }
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  generateWhatsAppLink(order: any) {
    const phone = process.env.DEFAULT_WHATSAPP_PHONE || order.user?.phone || '';
    let text = `🛒 *Nuevo Pedido Qbacano*\n\n`;
    text += `👤 Cliente: ${order.user.name}\n`;
    text += `📦 Productos:\n`;
    order.items.forEach((item: any, i: number) => {
      text += `${i+1}. ${item.productName} x${item.quantity} - $${Number(item.subtotal).toLocaleString()}\n`;
    });
    text += `\n💰 *Total: $${Number(order.totalAmount).toLocaleString()}*\n`;
    text += `🆔 ID: ${order.id}`;
    return `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`;
  }

  async updateStatusToSent(orderId: string, userId: string) {
    return this.prisma.order.update({
      where: { id: orderId, userId },
      data: { status: 'SENT_VIA_WHATSAPP' }
    });
  }
}
