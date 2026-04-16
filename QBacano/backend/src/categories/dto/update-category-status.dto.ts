import { IsBoolean } from 'class-validator';

export class UpdateCategoryStatusDto {
  @IsBoolean()
  is_active!: boolean;
}
