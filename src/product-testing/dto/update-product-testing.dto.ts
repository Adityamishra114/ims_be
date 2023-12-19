import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateProductTestingDto {
    @IsOptional()
    @IsString()
    UOM?: String
}
