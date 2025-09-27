// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { User } from 'src/user/entities/user.entity';
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from './jwt.strategy'; // <-- make sure you have this

@Module({
  imports: [
    ConfigModule, // (isGlobal: true in AppModule is fine; including here is harmless)
    TypeOrmModule.forFeature([User, Student, Trainer]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES', '1d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
