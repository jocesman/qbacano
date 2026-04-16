import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ValidateAdminDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(128)
  key!: string;
}
