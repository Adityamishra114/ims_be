import {  Post, Body, Patch, Param, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
 async signin(@Res() res, @Body() loginDto: LoginDto){
  try {
    const access =  await this.authService.signin(loginDto)
    res.status(HttpStatus.OK).json(access)
  } catch (error) {
    throw error
  }
 }

 @Post('logout')
 async logout(@Res() res, @Req() req){
  try {
    await this.authService.logout(req)
    res.status(HttpStatus.OK).json({response: "User logged out"})
  } catch (error) {
    throw error
  }
 }
}
