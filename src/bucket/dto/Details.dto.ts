import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"


export class Details {

    @IsNotEmpty()
    @IsString()
    name: String

    @IsNotEmpty()
    @IsString()
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