// import { Module } from '@nestjs/common';
// import { AdminController } from './admin.controller';
// import { AdminService } from './admin.service';
// import { AuthModule } from '../auth/auth.module';
// import { JwtModule } from '@nestjs/jwt';  

// @Module({
//   imports: [AuthModule],
//   controllers: [AdminController],
//   providers: [AdminService],
//   exports: [AdminService],
// })
// export class AdminModule {}

import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { SharedJwtModule } from '../shared/jwt.module';
import { share } from 'rxjs';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
    SharedJwtModule
  ],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}