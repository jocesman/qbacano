import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get('search/:query')
  async search(@Param('query') query: string) {
    return this.productsService.search(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  async create(@Body() productData: any) {
    return this.productsService.create(productData);
  }

  @Put('all/available')
  async setAllAvailable() {
    return this.productsService.setAllAvailable();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() productData: any) {
    return this.productsService.update(id, productData);
  }

  @Put(':id/availability')
  async updateAvailability(
    @Param('id') id: string,
    @Body('available') available: boolean,
  ) {
    return this.productsService.updateAvailability(id, available);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
