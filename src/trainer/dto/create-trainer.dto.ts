import {
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsNotEmpty,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Seniority } from 'src/util/seniority.enum';

export class CreateTrainerDto {
  @IsNotEmpty() @IsString() readonly name: string;
  @IsNotEmpty() @IsEmail() readonly email: string;
  @IsNotEmpty() @IsInt() @Min(18) readonly age: number;
  @IsOptional() seniority?: Seniority;
  @IsOptional() @IsInt() readonly academyId: number;
}
