import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

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

    if (error) throw new Error(`Error fetching products: ${error.message}`);
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Error fetching product: ${error.message}`);
    return data;
  }

  async search(query: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`);

    if (error) throw new Error(`Error searching products: ${error.message}`);
    return data || [];
  }

  async create(productData: any) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([{
        category: productData.category,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url || productData.image,
        available: productData.available ?? true,
        is_combo: productData.is_combo ?? false,
      }])
      .select()
      .single();

    if (error) throw new Error(`Error creating product: ${error.message}`);
    return data;
  }

  async update(id: string, productData: any) {
    const { data, error } = await this.supabase
      .from('products')
      .update({
        category: productData.category,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url || productData.image,
        available: productData.available,
        is_combo: productData.is_combo,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating product: ${error.message}`);
    return data;
  }

  async updateAvailability(id: string, available: boolean) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ available })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating availability: ${error.message}`);
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error deleting product: ${error.message}`);
    return { success: true };
  }

  async setAllAvailable() {
    const { error } = await this.supabase
      .from('products')
      .update({ available: true });

    if (error) throw new Error(`Error updating all products: ${error.message}`);
    return { success: true };
  }
}
