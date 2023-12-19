import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsOptional, IsSemVer, IsString, ValidateNested } from "class-validator"

class ProductsDto {

    @IsNotEmpty()
    @IsString()
    productName: String

    @IsNotEmpty()
    @IsString()
    category: String

    @IsNotEmpty()
    @IsString()
    Rate_Unit: String

    @IsNotEmpty()
    @IsString()
    quantity: String

    @IsNotEmpty()
    @IsString()
    GST: String

    @IsOptional()
    @IsString()
    description: String

    @IsOptional()
    @IsString()
    brand: String

    @IsOptional()
    @IsString()
    discount: String
    
    // totalValue: String
    // discountedPrice: String
    // GSTValue: String
    // costPrice: String
}

export class CreatePurchaseOrderDto {

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ProductsDto)
    products: ProductsDto[]

    @IsOptional()
    // @IsNotEmpty()
    @IsString()
    manufacturerId: String

    @IsNotEmpty()
    @IsString()
    storeName: String

    @IsOptional()
    @IsString()
    extraDiscount: String

}
