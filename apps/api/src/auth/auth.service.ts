import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import type { CreationAttributes } from 'sequelize';
import { compare, hash } from 'bcryptjs';
import type { AuthResponse, AuthUser } from '@ai-job-applier/shared';
import { User } from '../database/models/user.model';
import type { AuthenticatedUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email.');
    }

    const passwordHash = await hash(dto.password, 12);
    const user = await this.userModel.create({
      email,
      password: passwordHash,
      jobSearchTitle: ''
    } as CreationAttributes<User>);

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const isValidPassword = await compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return this.buildAuthResponse(user);
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return this.toAuthUser(user);
  }

  verifyAccessToken(token: string): AuthenticatedUser {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  private buildAuthResponse(user: User): AuthResponse {
    const authUser = this.toAuthUser(user);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email
    });

    return { accessToken, user: authUser };
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, email: user.email };
  }
}
