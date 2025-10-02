// create-student.dto.ts
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsDateString,
  IsArray,
  ArrayUnique,
  IsInt as IsIntEach,
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
  readonly academyId?: number;

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

  // optional at creation time
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIntEach({ each: true })
  readonly subjectIds?: number[];
}
