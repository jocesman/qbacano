import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly jwtService: JwtService,
  ) {}

  async validateAccessKey(
    key: string,
  ): Promise<{ valid: boolean; message: string; token?: string }> {
    const { data, error } = await this.supabase
      .from('admin_access')
      .select('id')
      .eq('access_key', key.trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, message: 'Clave incorrecta o inactiva' };
    }

    const token = this.jwtService.sign({
      role: 'admin',
      adminId: data.id,
      keyId: String(data.id),
    });

    return { valid: true, message: 'Acceso concedido', token };
  }

  verifyToken(token: string): { role: string; adminId: string } {
    try {
      return this.jwtService.verify<{ role: string; adminId: string }>(token);
    } catch {
      throw new UnauthorizedException('Token de administrador inválido');
    }
  }
}