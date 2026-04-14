import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('validate')
  async validateKey(@Body('key') key: string) {
    return this.adminService.validateAccessKey(key);
  }
}
