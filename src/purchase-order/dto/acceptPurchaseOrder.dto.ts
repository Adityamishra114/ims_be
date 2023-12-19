import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsSemVer, IsString, ValidateNested } from "class-validator"

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

    @IsOptional()
    @IsString()
    totalValue: String

    @IsOptional()
    @IsString()
    discountedPrice: String

    @IsOptional()
    @IsString()
    GSTValue: String
    
    @IsOptional()
    @IsString()
    costPrice: String
}


export class AcceptPurchaseOrderDto {

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ProductsDto)
    products: ProductsDto[]
    
    @IsOptional()
    @IsString()
    extraDiscount?: String

    @IsOptional()
    @IsBoolean()
    isPaid?: Boolean = false

    @IsOptional()
    @IsString()
    expectedAt?: String

}