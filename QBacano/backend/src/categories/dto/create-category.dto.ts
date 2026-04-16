import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(64)
  slug!: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
