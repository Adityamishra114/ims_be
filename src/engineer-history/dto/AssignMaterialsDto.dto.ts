import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

class MaterialsDto {

    @IsNotEmpty()
    @IsString()
    name: String

    @IsNotEmpty()
    @IsString()
    quantity: String

    @IsNotEmpty()
    @IsString()
    unit: String
} 

export class AssignMaterialsDto {

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => MaterialsDto)
    materials: MaterialsDto[]

    @IsOptional()
    @IsString()
    engineerId: String
   
}
