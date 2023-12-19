import { IsIn, IsNotEmpty, IsObject, IsOptional, IsSemVer, IsString } from "class-validator"


export class AllPurchaseOrderDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(['pending', 'accepted', 'rejected', 'all'])
    statusPage: String

    @IsOptional()
    @IsObject()
    filter?: Object 

    @IsOptional()
    @IsString()
    storeName: String
}