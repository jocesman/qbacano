import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async validateAccessKey(key: string): Promise<{ valid: boolean; message: string }> {
    const { data, error } = await this.supabase
      .from('admin_access')
      .select('id')
      .eq('access_key', key.trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, message: 'Clave incorrecta o inactiva' };
    }

    return { valid: true, message: 'Acceso concedido' };
  }
}