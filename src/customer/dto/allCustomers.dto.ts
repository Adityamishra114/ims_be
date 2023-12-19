import { IsArray, IsBoolean, IsIBAN, IsIn, IsObject, IsOptional, IsString } from "class-validator";


export class AllCustomersDto {

    @IsOptional()
    @IsArray()
    @IsObject({each: true})
    filters?: Array<Object> = []

    @IsOptional()
    @IsString()
    @IsIn(['all', 'any', ''])
    apply?: String = ''
}