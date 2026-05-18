import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    const email = this.normalizeEmail(payload.email);
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await this.usersService.createUser({
      name: payload.name,
      email,
      hashedPassword,
    });

    return {
      user: this.usersService.toSafeUser(user),
      accessToken: this.signToken(user.id, user.email, user.role),
    };
  }

  async login(payload: LoginDto) {
    const email = this.normalizeEmail(payload.email);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(payload.password, user.hashedPassword);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: this.usersService.toSafeUser(user),
      accessToken: this.signToken(user.id, user.email, user.role),
    };
  }

  private signToken(id: string, email: string, role: string) {
    return this.jwtService.sign({ sub: id, email, role });
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
