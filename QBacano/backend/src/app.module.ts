import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { StatsModule } from './stats/stats.module';
import { SupabaseModule } from './supabase.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { CategoriesModule } from './categories/categories.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    AuthModule,
    SupabaseModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    StatsModule,
    UploadsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
