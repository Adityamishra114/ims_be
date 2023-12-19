import { Type } from "class-transformer"
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

class MaterialDto {

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

export class MaterialsDto {

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => MaterialDto)
    materials: MaterialDto[]

    @IsNotEmpty()
    @IsString()
    @IsIn(['success', 'failed'])
    status: String

    @IsOptional()
    @IsString()
    remark?: String
   
}
