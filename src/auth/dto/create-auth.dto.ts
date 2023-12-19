import { IsEmail, IsString, MinLength } from "class-validator"

export class LoginDto {

    @IsString()
    username: String

    @IsString()
    password: String
}
