import { Type } from "class-transformer"
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

export class CreateStoreDto {

    @IsOptional()
    @IsNumber()
    seq?: number
    
    @IsNotEmpty()
    @IsString()
    storeName: String

    @IsOptional()
    @IsString()
    shopLocation?: String

    @IsOptional()
    @IsString()
    GSTNo?: String

    @IsOptional()
    @IsString()
    PANNo?: String

    @IsOptional()
    @IsDate()
    createdAt?: Date

    @IsOptional()
    @IsString()
    createdBy?: String

    @IsOptional()
    @IsString()
    createdById?: String

}
