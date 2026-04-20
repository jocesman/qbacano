import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';
import { SharedJwtModule } from '../shared/jwt.module';
import { AdminAuthGuard } from '../auth/admin-auth.guard'; 

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService, AdminAuthGuard],
  exports: [ProductsService],
})
export class ProductsModule {}