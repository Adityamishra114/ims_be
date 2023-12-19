import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(@Inject(forwardRef(() => UserService)) private userService: UserService, 
    private jwtService: JwtService){}
 
  async signin(loginDto: LoginDto){
    console.log(loginDto)
    try {
       
      // Get user
      const {username, password} = loginDto
      const user = await this.userService.findUsername(username, password)
      
      // If logged in somewhere then cant relogin
      if (user.status === "active"){
        throw new HttpException("Already logged in", HttpStatus.CONFLICT)
      }
      
      // Change status
      user.status = "active"

      await user.save()

      // Roles map
      const roleNumber = {
        "admin": "1122",
        "subadmin": "2211",
        "engineer": "1111"
      }
      
      // Send token
      const payload = {userId: user._id, role: user.role, roles: process.env.roles.split(',')}
      return { accessToken: await this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        secret: process.env.JWT_SECRET
      }), user: user.username, role: user.role}

    } catch (error) {
      console.log(error.response)
      throw error
    }
  }

  async logout(req){
    try {

      // Change status
      req.user.status = 'inactive'

      await req.user.save()
      return 'User logged out'

    } catch (error) {
      throw error
    }
  }
}
