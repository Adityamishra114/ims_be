import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateMaterialsDto {

    @IsNotEmpty()
    @IsString()
    name: String

    @IsNotEmpty()
    @IsString()
    unit: String

    @IsNotEmpty()
    @IsString()
    storeName: String

    @IsOptional()
    @IsString()
    category?: String

    @IsOptional()
    @IsString()
    quantity?: String

    @IsOptional()
    @IsString()
    createdBy?: String
    
    @IsOptional()
    @IsString()
    createdById?: String

    @IsOptional()
    @IsString()
    createdByRole?: String
}