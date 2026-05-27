import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { getApiEnvironment } from '../common/config/env.validation';
import { User } from '../database/models/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: () => {
        const env = getApiEnvironment(process.env);
        return {
          secret: env.jwtSecret,
          signOptions: { expiresIn: env.jwtExpiresIn as `${number}d` | `${number}h` }
        };
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule]
})
export class AuthModule {}
