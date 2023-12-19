import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    forwardRef(() => UserModule),
    JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
