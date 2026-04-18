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

  private formatProduct(item: any) {
    return {
      ...item,
      category: item.categories?.slug || item.category || 'uncategorized',
      category_data: item.categories || null,
    };
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
      .select(`
        *,
        categories!fk_products_category (
          slug,
          title,
          is_active
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      throw new InternalServerErrorException('No se pudieron obtener productos');
    }
    
    // Filtrar por categorías activas usando la relación
    const filteredData = (data || []).filter(item => {
      if (!activeCategorySlugs) return true;
      return item.categories && activeCategorySlugs.has(String(item.categories.slug));
    });
    
    return filteredData.map((item) => this.formatProduct(item));
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories!fk_products_category (
          slug,
          title,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.formatProduct(data);
  }

  async search(query: string) {
    const activeCategorySlugs = await this.getActiveCategorySlugs();
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories!fk_products_category (
          slug,
          title,
          is_active
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
      throw new InternalServerErrorException('No se pudo buscar productos');
    }
    
    // Filtrar por categorías activas usando la relación
    const filteredData = (data || []).filter(item => {
      if (!activeCategorySlugs) return true;
      return item.categories && activeCategorySlugs.has(String(item.categories.slug));
    });
    
    return filteredData.map((item) => this.formatProduct(item));
  }

  async create(productData: CreateProductDto) {
    // Primero obtener el category_id desde el slug
    const { data: categoryData, error: categoryError } = await this.supabase
      .from('categories')
      .select('id')
      .eq('slug', productData.category)
      .single();

    if (categoryError || !categoryData) {
      throw new InternalServerErrorException('Categoría no encontrada');
    }

    const insertPayload: Record<string, unknown> = {
      category_id: categoryData.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      available: productData.available ?? true,
      is_combo: productData.is_combo ?? false,
    };
    if (productData.image_url) {
      insertPayload.image_url = productData.image_url;
    }
    if (productData.image_public_id) {
      insertPayload.image_public_id = productData.image_public_id;
    }

    const { data, error } = await this.supabase
      .from('products')
      .insert([this.compactPayload(insertPayload)])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('No se pudo crear el producto');
    }
    return this.findById(String(data.id));
  }

  async update(id: string, productData: UpdateProductDto) {
    // Si se está actualizando la categoría, obtener el category_id desde el slug
    let categoryId = undefined;
    if (productData.category) {
      const { data: categoryData, error: categoryError } = await this.supabase
        .from('categories')
        .select('id')
        .eq('slug', productData.category)
        .single();

      if (categoryError || !categoryData) {
        throw new InternalServerErrorException('Categoría no encontrada');
      }
      categoryId = categoryData.id;
    }

    const updatePayload: Record<string, unknown> = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      available: productData.available,
      is_combo: productData.is_combo,
      image_public_id: productData.image_public_id,
    };
    
    if (categoryId !== undefined) {
      updatePayload.category_id = categoryId;
    }
    if (productData.image_url !== undefined) {
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
    return this.findById(String(data.id));
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
