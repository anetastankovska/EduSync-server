import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUsersDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (isPasswordValid) {
        delete user.password;
        return user;
      }
    }
    return null;
  }

  async login(user: LoginUsersDto) {
    const validUser = await this.validateUser(user.email, user.password);

    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      email: validUser.email,
      sub: validUser.id, // main subject (unique identifier) of the token
      role: validUser.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  async register({ email, password, role }: RegisterUserDto) {
    // Check if the user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // A salt is a random value added to the password before hashing.
    // It ensures that even if two users have the same password, their hashes will be different because different salts are used

    // Rounds refers to the number of iterations or "rounds" the hashing algorithm will undergo to produce the final hash.
    // Each round makes the hash calculation more complex and time-consuming. This is beneficial for security because it makes the hash computation slower
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    const user = await this.userService.create(email, hash, role);

    delete user.password;
    return user;
  }
}
