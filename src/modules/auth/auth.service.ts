import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<{ access_token: string }> {
    const payload = { email: user.email, id: user.id };
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      throw new Error('JWT_SECRET_KEY is not defined');
    }

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: secretKey,
      }),
    };
  }
}
