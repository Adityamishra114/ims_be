import { Type } from "class-transformer"
import { IsDataURI, IsDate, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"

export class UpdateStoreDto{

    @IsOptional()
    @IsString()
    storeName?: String

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
    updatedAt?: Date

    @IsOptional()
    @IsString()
    updatedBy?: String

    @IsOptional()
    @IsString()
    updatedById?: String
}
