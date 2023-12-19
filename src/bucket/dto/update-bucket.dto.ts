import { Type } from "class-transformer"
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

export class UpdateQntDto{

    @IsArray()
    @IsString({each: true})
    ids: String[]

    @IsNotEmpty()
    @IsString()
    extraDiscount: String

    @IsOptional()
    @IsNumber()
    subTotal?: number

    @IsOptional()
    @IsNumber()
    totalItems?: number
  
    @IsOptional()
    @IsNumber()
    orderTotal?: number
    
    @IsOptional()
    @IsDate()
    updatedAt?: Date
}
