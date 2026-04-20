import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedJwtModule } from '../shared/jwt.module';
import { AdminAuthGuard } from './admin-auth.guard';

@Module({
  imports: [SharedJwtModule], // 🔥 usamos el compartido
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminAuthGuard, // 🔥 registramos el guard
  ],
  exports: [
    AdminAuthGuard, // 🔥 lo hacemos usable en otros módulos
    SharedJwtModule, // 🔥 exportamos JWT también
  ],
})
export class AuthModule {}