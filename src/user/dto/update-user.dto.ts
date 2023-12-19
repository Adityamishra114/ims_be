import { IsDataURI, IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UpdateUserDto {
    
    @IsOptional()
    @IsString()
    username?: String

    @IsOptional()
    @IsString()
    password?: String

    @IsOptional()
    @IsString()
    email?: String
    
    @IsOptional()
    @IsString()
    phoneNumber?: String

    @IsOptional()
    @IsString()
    categoryOfEng?: String

    @IsOptional()
    @IsString()
    updatedBy?: String

    @IsOptional()
    @IsString()
    updatedByRole?: String

    @IsOptional()
    @IsString()
    updatedById?: String

    @IsOptional()
    @IsDate()
    updatedAt?: Date
}
