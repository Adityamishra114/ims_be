import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCostDto {
    
  @IsNotEmpty()
  @IsString()
  GST: String

  @IsNotEmpty()
  @IsString()
  Rate_Unit: String  

  @IsNotEmpty()
  @IsString()
  quantity: String

  @IsNotEmpty()
  @IsString()
  sellingPrice: String

  @IsOptional()
  @IsString()
  discount?: String

  @IsOptional()
  @IsString()
  GSTValue?: String

  @IsOptional()
  @IsString()
  totalValue?: String
  
  @IsOptional()
  @IsString()
  costPrice?: String
}
