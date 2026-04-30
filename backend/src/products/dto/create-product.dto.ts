import { IsString, IsNumber, IsUUID, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
