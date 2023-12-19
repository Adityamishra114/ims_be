
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from "class-transformer"
import { ProductPurchaseDetailsDto, ProductSellDetailsDto, ProductTestingDetailsDto } from './create-product.dto';

class ProductDetailsDto {
  @IsOptional()
  @IsString()
  productName?: String
  
  @IsOptional()
  @IsString()
  category?: String

  @IsOptional()
  @IsString()
  barcodeId?: String

  @IsOptional()
  @IsString()
  lotNo?: String

  @IsOptional()
  @IsString()
  articleCode?: String

  @IsOptional()
  @IsString()
  description?: String

  @IsOptional()
  @IsString()
  brand?: String

  @IsOptional()
  @IsString()
  HSNCode?: String
  
  @IsOptional()
  @IsString()
  subCategory?: String

}

export class UpdateProductDto {

  @ValidateNested({each: true})
  @Type(() => ProductDetailsDto)
  productDetailsDto: ProductDetailsDto

  @ValidateNested({each: true})
  @Type(() => ProductPurchaseDetailsDto)
  productPurchaseDetailsDto: ProductPurchaseDetailsDto

  @ValidateNested({each: true})
  @Type(() => ProductTestingDetailsDto)
  productTestingDetailsDto: ProductTestingDetailsDto
  
  @ValidateNested({each: true})
  @Type(() => ProductSellDetailsDto)
  productSellDetailsDto: ProductSellDetailsDto
}

