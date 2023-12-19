import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user/user.service';

interface UserRequest extends Request {
  user: any;
}
@Injectable()
export class isAuthenticated implements NestMiddleware {

  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: UserRequest, res: Response, next: NextFunction) {
    try {
      if ( req.headers.authorization ) {
        let decoded
        try {
          const token = req.headers.authorization.split(' ')[1];
          decoded = await this.jwt.verify(token, { secret: process.env.JWT_SECRET });
        } catch (error) {
          throw  new HttpException('Invalid token', 555)
        }
        const user = await this.userService.findOneAuth(decoded.userId);
        req.user = user;
        console.log('Passed from middleware');
        next();
      } else {
        throw new HttpException('No token found', HttpStatus.NOT_FOUND);
      }
    } catch(error) {
      console.log(error)
      throw  error;
    }
  }
}
