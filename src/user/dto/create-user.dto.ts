import { IsEAN, IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    username: String

    @IsNotEmpty()
    @IsString()
    password: String
    
    @IsNotEmpty()
    @IsString()
    storeName: String

    @IsNotEmpty()
    @IsString()
    @IsIn(["subadmin", "engineer"])
    role: string

    @IsOptional()
    @IsString()
    categoryOfEng?: String
    
    @IsOptional()
    @IsNumber()
    seq?: number

    @IsOptional()
    @IsString()
    address?: String

    @IsOptional()
    @IsString()
    phoneNumber?: String

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: String

    // @IsOptional()
    // @IsString()
    // assignedTo?: String

    // @IsOptional()
    // @IsString()
    // assignedToId?: String

    @IsOptional()
    @IsString()
    createdBy?: String

    @IsOptional()
    @IsString()
    createdByRole?: String

    @IsOptional()
    @IsString()
    createdById?: String
}
