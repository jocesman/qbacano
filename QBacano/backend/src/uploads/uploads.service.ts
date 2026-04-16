import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {}

  signUpload(folder?: string) {
    const cloudName = this.configService.get<string>('app.cloudinary.cloudName');
    const apiKey = this.configService.get<string>('app.cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('app.cloudinary.apiSecret');
    const defaultFolder = this.configService.get<string>('app.cloudinary.folder');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloudinary no está configurado correctamente',
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const targetFolder = folder || defaultFolder || 'qbacano/products';
    const paramsToSign = {
      folder: targetFolder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return {
      cloudName,
      apiKey,
      folder: targetFolder,
      timestamp,
      signature,
    };
  }
}
