import { Controller, Get, Post, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Req() req: any) {
    const order = await this.ordersService.createOrder(req.user.id);
    const whatsappLink = this.ordersService.generateWhatsAppLink(order);
    return { order, whatsappLink };
  }

  @Get()
  findAll(@Req() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.getOrderById(id, req.user.id);
  }

  @Get(':id/whatsapp')
  getWhatsAppLink(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.getOrderById(id, req.user.id).then(order => ({
      url: this.ordersService.generateWhatsAppLink(order)
    }));
  }

  @Patch(':id/send')
  markAsSent(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.updateStatusToSent(id, req.user.id);
  }
}
