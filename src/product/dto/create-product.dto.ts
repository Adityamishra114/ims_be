import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

class ProductDetailsDto {
  @IsNotEmpty()
  @IsString()
  productName: String
  
  @IsNotEmpty()
  @IsString()
  category: String
  
  @IsNotEmpty()
  @IsString()
  storeName: String

  @IsNotEmpty()
  @IsString()
  barcodeId: String

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

export class ProductPurchaseDetailsDto{

  @IsOptional()
  @IsString()
  GST: String

  @IsOptional()
  @IsString()
  Rate_Unit: String
 
  @IsOptional()
  @IsString()
  manufacturer?: String

  @IsOptional()
  @IsString()
  quantity?: String

}

export class ProductTestingDetailsDto{
  @IsOptional()
  @IsString()
  UOM?: String
}

export class ProductSellDetailsDto{
  
  @IsOptional()
  @IsString()
  sellingPrice?: String

  @IsOptional()
  @IsString()
  discount?: String
}

export class CreateProductDto {

  @IsOptional()
  @IsBoolean()
  passed?: Boolean = false

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
