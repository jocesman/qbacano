import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ValidateAdminDto } from './dto/validate-admin.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('validate')
  async validateKey(@Body() body: ValidateAdminDto) {
    return this.adminService.validateAccessKey(body.key);
  }
}
