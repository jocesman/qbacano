import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (): SupabaseClient => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
        
        if (!supabaseUrl || !serviceRole) {
          throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE en .env');
        }
        
        return createClient(supabaseUrl, serviceRole);
      },
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
