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

  private compactPayload(payload: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    );
  }

  private async getActiveCategorySlugs(): Promise<Set<string> | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true);

    if (error) {
      if (error.message?.toLowerCase().includes('relation')) {
        return null;
      }
      throw new InternalServerErrorException('No se pudieron cargar categorías');
    }

    return new Set((data || []).map((category) => String(category.slug)));
  }

  private filterByActiveCategories(
    items: any[],
    activeSlugs: Set<string> | null,
  ) {
    if (!activeSlugs) return items;
    return items.filter((item) => activeSlugs.has(String(item.category)));
  }

  async findAll() {
    const activeCategorySlugs = await this.getActiveCategorySlugs();
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new InternalServerErrorException('No se pudieron obtener productos');
    }
    return this.filterByActiveCategories(data || [], activeCategorySlugs);
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
    const activeCategorySlugs = await this.getActiveCategorySlugs();
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`);

    if (error) {
      throw new InternalServerErrorException('No se pudo buscar productos');
    }
    return this.filterByActiveCategories(data || [], activeCategorySlugs);
  }

  async create(productData: CreateProductDto) {
    const insertPayload: Record<string, unknown> = {
      category: productData.category,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      available: productData.available ?? true,
      is_combo: productData.is_combo ?? false,
    };
    if (productData.image_url) {
      insertPayload.image_url = productData.image_url;
    }

    const { data, error } = await this.supabase
      .from('products')
      .insert([this.compactPayload(insertPayload)])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('No se pudo crear el producto');
    }
    return data;
  }

  async update(id: string, productData: UpdateProductDto) {
    const updatePayload: Record<string, unknown> = {
      category: productData.category,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      available: productData.available,
      is_combo: productData.is_combo,
    };
    if (productData.image_url) {
      updatePayload.image_url = productData.image_url;
    }

    const { data, error } = await this.supabase
      .from('products')
      .update(this.compactPayload(updatePayload))
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
