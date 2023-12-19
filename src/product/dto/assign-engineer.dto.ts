import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class AssignEngineerDto {

  @IsArray()
  @IsString({each: true})
  ids: String[]

  @IsNotEmpty()
  @IsString()
  engineerId: String

  @IsNotEmpty()
  @IsString()
  phase: String

  @IsOptional()
  @IsString()
  remark?: String

  @IsOptional()
  @IsString()
  dueDate?: String
}
