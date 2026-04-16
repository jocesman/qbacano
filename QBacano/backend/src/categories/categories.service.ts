import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  private tableMissingHint() {
    return (
      "Tabla 'categories' no encontrada. Crea la tabla en Supabase para habilitar esta función."
    );
  }

  async findActive() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) {
      if (error.message?.toLowerCase().includes('relation')) {
        throw new InternalServerErrorException(this.tableMissingHint());
      }
      throw new InternalServerErrorException('No se pudieron cargar categorías');
    }

    return data || [];
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      if (error.message?.toLowerCase().includes('relation')) {
        throw new InternalServerErrorException(this.tableMissingHint());
      }
      throw new InternalServerErrorException('No se pudieron cargar categorías');
    }

    return data || [];
  }

  async create(categoryData: CreateCategoryDto) {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([
        {
          title: categoryData.title.trim(),
          slug: categoryData.slug.trim().toLowerCase(),
          is_active: categoryData.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe una categoría con ese slug');
      }
      if (error.message?.toLowerCase().includes('relation')) {
        throw new InternalServerErrorException(this.tableMissingHint());
      }
      throw new InternalServerErrorException('No se pudo crear la categoría');
    }

    return data;
  }

  async update(id: string, categoryData: UpdateCategoryDto) {
    const { data, error } = await this.supabase
      .from('categories')
      .update({
        title: categoryData.title?.trim(),
        slug: categoryData.slug?.trim().toLowerCase(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('No se pudo actualizar la categoría');
    }

    return data;
  }

  async updateStatus(id: string, isActive: boolean) {
    const { data, error } = await this.supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('No se pudo actualizar estado de categoría');
    }

    return data;
  }

  async remove(id: string) {
    // First check if category has products
    const { data: products, error: productsError } = await this.supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (productsError) {
      throw new InternalServerErrorException('Error al verificar productos de la categoría');
    }

    if (products && products.length > 0) {
      throw new ConflictException('No se puede eliminar la categoría porque tiene productos asociados');
    }

    // Delete the category
    const { data, error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('No se pudo eliminar la categoría');
    }

    return data;
  }
}
