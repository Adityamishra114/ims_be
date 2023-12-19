import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

export class CreateBucketDto {

    @IsOptional()
    @IsString()
    userId?: String

    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    ids: String[]

    @IsNotEmpty()
    @IsString()
    storeName: String

    @IsOptional()
    @IsString()
    productName?: String
 
    @IsOptional()
    @IsString()
    description?: String

    @IsOptional()
    @IsString()
    brand?: String

    @IsOptional()
    @IsString()
    category?: String

    @IsOptional()
    @IsNumber()
    GST?: number

    @IsOptional()
    @IsNumber()
    GSTValue?: number

    @IsOptional()
    @IsNumber()
    sllingPrice?: number

    @IsOptional()
    @IsNumber()
    sellingAt?: number

    @IsOptional()
    @IsNumber()
    discount?: number
    
    @IsOptional()
    @IsNumber()
    discountedPrice?: number
}
