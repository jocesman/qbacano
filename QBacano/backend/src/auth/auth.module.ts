import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthGuard } from './admin-auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.auth.jwtSecret'),
        signOptions: {
          expiresIn: (configService.get<string>('app.auth.jwtExpiresIn') ||
            '10m') as never,
        },
      }),
    }),
  ],
  providers: [AdminAuthGuard],
  exports: [JwtModule, AdminAuthGuard],
})
export class AuthModule {}
