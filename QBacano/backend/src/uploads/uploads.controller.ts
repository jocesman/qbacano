import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { SignUploadDto } from './dto/sign-upload.dto';

@Controller('api/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('sign')
  @UseGuards(AdminAuthGuard)
  sign(@Body() body: SignUploadDto) {
    return this.uploadsService.signUpload(body.folder);
  }
}
