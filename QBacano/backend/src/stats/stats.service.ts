import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StatsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async getSalesStats(filters?: { dateFrom?: string; dateTo?: string }) {
    let query = this.supabase.from('orders').select('*');

    if (filters?.dateFrom) {
      query = query.gte('created_at', `${filters.dateFrom}T00:00:00`);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error fetching stats: ${error.message}`);

    const orders = data || [];
    const today = new Date().toDateString();

    let totalSales = 0;
    let pendingAmount = 0;
    let cancelledAmount = 0;
    let todaySales = 0;
    const productCounts: Record<string, number> = {};

    orders.forEach((order) => {
      const amount = order.total || 0;
      const status = (order.status || 'pending').toLowerCase();
      const orderDate = new Date(order.created_at).toDateString();

      if (status === 'delivered') {
        totalSales += amount;
        if (orderDate === today) todaySales += amount;
      } else if (status === 'cancelled') {
        cancelledAmount += amount;
      } else {
        pendingAmount += amount;
      }

      if (status !== 'cancelled' && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        });
      }
    });

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, quantity: qty }));

    return {
      totalSales,
      pendingAmount,
      cancelledAmount,
      todaySales,
      totalOrders: orders.length,
      topProducts,
    };
  }
}
