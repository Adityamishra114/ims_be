import { IsArray, IsBoolean, IsIBAN, IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";


export class AllProductsDto {

    @IsNotEmpty()
    @IsString()
    statusPage: String
    
    @IsOptional()
    @IsBoolean()
    moved: Boolean = false

    @IsOptional()
    @IsArray()
    @IsObject({each: true})
    filters?: Array<Object> = []

    @IsOptional()
    @IsArray()
    @IsObject({each: true})
    filters1?: Array<Object> = []

    @IsOptional()
    @IsArray()
    @IsObject({each: true})
    filters2?: Array<Object> = []
    
    @IsOptional()
    @IsArray()
    @IsObject({each: true})
    filters3?: Array<Object> = []

    @IsOptional()
    @IsString()
    @IsIn(['all', 'any', ''])
    apply?: String = ''

    @IsOptional()
    @IsString()
    @IsIn(['purchase', 'testing', 'sell'])
    type?: String

    @IsOptional()
    @IsString()
    storeName?: String
}