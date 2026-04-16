import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

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
  @UseGuards(AdminAuthGuard)
  async create(@Body() productData: CreateProductDto) {
    return this.productsService.create(productData);
  }

  @Put('all/available')
  @UseGuards(AdminAuthGuard)
  async setAllAvailable() {
    return this.productsService.setAllAvailable();
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  async update(@Param('id') id: string, @Body() productData: UpdateProductDto) {
    return this.productsService.update(id, productData);
  }

  @Put(':id/availability')
  @UseGuards(AdminAuthGuard)
  async updateAvailability(
    @Param('id') id: string,
    @Body('available') available: boolean,
  ) {
    return this.productsService.updateAvailability(id, available);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
