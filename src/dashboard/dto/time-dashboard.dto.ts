import { IsIn, IsOptional, IsString } from "class-validator"

export class TimeDashboardDto {

    @IsOptional()
    @IsString()
    storeName? : String

    @IsOptional()
    @IsString()
    year? : String



}
