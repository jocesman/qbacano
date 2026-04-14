import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { StatsModule } from './stats/stats.module';
import { SupabaseModule } from './supabase.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    SupabaseModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    StatsModule,
  ],
})
export class AppModule {}
