import { IsIn, IsOptional, IsString } from "class-validator"

export class ProductsDashboardDto {

    @IsOptional()
    @IsString()
    storeName? : String

    @IsOptional()
    @IsString()
    @IsIn(['number', 'value'])
    type?: String
}
