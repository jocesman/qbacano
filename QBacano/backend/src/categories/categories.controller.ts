import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findActive() {
    return this.categoriesService.findActive();
  }

  @Get('all')
  @UseGuards(AdminAuthGuard)
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async create(@Body() categoryData: CreateCategoryDto) {
    return this.categoriesService.create(categoryData);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  async update(@Param('id') id: string, @Body() categoryData: UpdateCategoryDto) {
    return this.categoriesService.update(id, categoryData);
  }

  @Put(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateCategoryStatusDto,
  ) {
    return this.categoriesService.updateStatus(id, body.is_active);
  }
}
