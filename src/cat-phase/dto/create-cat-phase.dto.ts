import { IsString, IsNotEmpty, IsOptional, IsArray, IsDate } from "class-validator"

export class CreateCatPhaseDto {

    @IsNotEmpty()
    @IsString()
    category: String

    @IsNotEmpty()
    @IsString()
    storeName: String

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    categoryPhases?: String[]

    @IsOptional()
    @IsDate()
    createdAt?: Date

    @IsOptional()
    @IsString()
    createdBy?: String

    @IsOptional()
    @IsString()
    createdByRole?: String
}
