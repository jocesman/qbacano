import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreDto) {
    return this.prisma.store.create({ data: dto });
  }

  async findAll() {
    return this.prisma.store.findMany({ include: { products: { where: { active: true } } } });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({ 
      where: { id },
      include: { products: { where: { active: true } } }
    });
    if (!store) throw new NotFoundException('Tienda no encontrada');
    return store;
  }

  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Tienda no encontrada');
    return this.prisma.store.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Tienda no encontrada');
    return this.prisma.store.delete({ where: { id } });
  }
}
