import { IsString, IsNotEmpty, IsOptional, IsArray, IsDate } from "class-validator"

export class UpdateCatPhaseDto {

    @IsOptional()
    @IsString()
    category?: String

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    categoryPhases?: String[]

    @IsOptional()
    @IsDate()
    updatedAt?: Date


}
