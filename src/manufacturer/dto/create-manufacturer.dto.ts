import { Type } from "class-transformer"
import { IsAlpha, IsArray, IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { ObjectId, isValidObjectId } from "mongoose"

export class CreateManufacturerDto {
    @IsNotEmpty()
    @IsString()
    name: String

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: String

    @IsOptional()
    @IsString()
    phone?: String

    @IsOptional()
    @IsString()
    address?: String

    @IsOptional()
    @IsString()
    city?: String

    @IsOptional()
    @IsString()
    state?: String

    @IsOptional()
    @IsString()
    country?: String

    @IsOptional()
    @IsString()
    pincode?: String

    @IsOptional()
    @IsString()
    GSTNo?: String

    @IsOptional()
    @IsString()
    PANNo?: String
}

