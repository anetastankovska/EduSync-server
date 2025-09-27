import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/user/entities/user.entity';
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Role } from 'src/util/role.enum';

import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUsersDto } from './dto/login-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Student) private readonly students: Repository<Student>, // <-- index [1]
    @InjectRepository(Trainer) private readonly trainers: Repository<Trainer>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    const { password, ...safe } = user;
    return safe;
  }

  async login(user: LoginUsersDto) {
    const valid = await this.validateUser(user.email, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: valid.email, sub: valid.id, role: valid.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register({ email, password, role }: RegisterUserDto) {
    // allow FE to send 'student' | 'trainer' | 'admin' (lowercase)
    const normalized = (role ?? 'student').toString().toLowerCase() as
      | 'student'
      | 'trainer'
      | 'admin';
    const roleMap: Record<'student' | 'trainer' | 'admin', Role> = {
      student: Role.Student,
      trainer: Role.Trainer,
      admin: Role.Admin,
    };
    const resolvedRole = roleMap[normalized];

    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('User already exists');

    const hash = await bcrypt.hash(password, 10);

    return this.dataSource.transaction(async (trx) => {
      // 1) create user
      const user = trx.create(User, {
        email,
        password: hash,
        role: resolvedRole,
      });
      await trx.save(User, user);

      // 2) create profile when needed
      if (resolvedRole === Role.Student) {
        const student = trx.create(Student, {
          userId: user.id,
          name: '', // placeholder (let them fill later)
          email: user.email, // prefill from user
          academyId: null, // or null, or pick default; adjust per your logic
          address: null,
          telephone: null,
          dateOfBirth: null,
        });
        await trx.save(Student, student);
      } else if (resolvedRole === Role.Trainer) {
        const trainer = trx.create(Trainer, {
          userId: user.id,
          name: '',
          email: user.email,
          age: 18,
          seniority: null, // if null not allowed, set a default
          academyId: null, // or null / default
        });
        await trx.save(Trainer, trainer);
      }
      // Role.Admin → nothing else to create

      const { password, ...safe } = user;
      return safe;
    });
  }
}
