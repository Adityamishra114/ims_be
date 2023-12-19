import { IsArray, IsBoolean, IsIBAN, IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";


export class StoresTransferDto {

    @IsArray()
    @IsString({each:true})
    ids: String[]

    @IsNotEmpty()
    @IsString()
    store1: String
    
    @IsNotEmpty()
    @IsString()
    store2: String
}