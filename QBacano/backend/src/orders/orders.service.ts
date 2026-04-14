import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async findAll(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
    let query = this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', `${filters.dateFrom}T00:00:00`);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
    }

    const { data, error } = await query.limit(200);
    if (error) throw new Error(`Error fetching orders: ${error.message}`);
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Error fetching order: ${error.message}`);
    return data;
  }

  async create(orderData: any) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        items: orderData.items,
        total: orderData.total,
        status: 'pending',
        payment_method: orderData.payment_method || 'whatsapp',
      }])
      .select()
      .single();

    if (error) throw new Error(`Error creating order: ${error.message}`);
    return data;
  }

  async updateStatus(id: string, status: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating order: ${error.message}`);
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error deleting order: ${error.message}`);
    return { success: true };
  }
}
