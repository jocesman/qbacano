import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async findAll() {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new InternalServerErrorException('No se pudieron obtener productos');
    }
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Producto no encontrado');
    }
    return data;
  }

  async search(query: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`);

    if (error) {
      throw new InternalServerErrorException('No se pudo buscar productos');
    }
    return data || [];
  }

  async create(productData: CreateProductDto) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([{
        category: productData.category,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url,
        image_public_id: productData.image_public_id,
        available: productData.available ?? true,
        is_combo: productData.is_combo ?? false,
      }])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('No se pudo crear el producto');
    }
    return data;
  }

  async update(id: string, productData: UpdateProductDto) {
    const { data, error } = await this.supabase
      .from('products')
      .update({
        category: productData.category,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url,
        image_public_id: productData.image_public_id,
        available: productData.available,
        is_combo: productData.is_combo,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('No se pudo actualizar el producto');
    }
    return data;
  }

  async updateAvailability(id: string, available: boolean) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ available })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('No se pudo actualizar disponibilidad');
    }
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException('No se pudo eliminar el producto');
    }
    return { success: true };
  }

  async setAllAvailable() {
    const { error } = await this.supabase
      .from('products')
      .update({ available: true });

    if (error) {
      throw new InternalServerErrorException('No se pudo actualizar productos');
    }
    return { success: true };
  }
}
