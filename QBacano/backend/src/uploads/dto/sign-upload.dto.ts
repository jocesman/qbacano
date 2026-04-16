import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SignUploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  folder?: string;
}
