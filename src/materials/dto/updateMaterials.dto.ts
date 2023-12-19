import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateMaterialsDto {

    @IsOptional()
    @IsString()
    name?: String

    @IsOptional()
    @IsString()
    unit?: String
    
    @IsOptional()
    @IsString()
    quantity?: String

    @IsOptional()
    @IsString()
    updatedBy?: String
    
    @IsOptional()
    @IsString()
    updatedById?: String

    @IsOptional()
    @IsString()
    updatedByRole?: String

    @IsOptional()
    @IsDate()
    updatedAt?: Date
}