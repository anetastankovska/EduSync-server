// src/student/dto/create-student.dto.ts
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsInt()
  readonly academyId: number;

  // ⬇️ flattened optional details
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  readonly telephone?: string;

  @IsOptional()
  @IsDateString()
  readonly dateOfBirth?: string; // 'YYYY-MM-DD'
}
