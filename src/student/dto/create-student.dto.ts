import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  Min,
  MinLength,
  IsObject,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { CreateStudentDetailDto } from 'src/student-details/dto/create-student-detail.dto';
export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsInt()
  @Min(18)
  readonly age: number;

  @IsNotEmpty()
  @IsInt()
  readonly academyId: number;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateStudentDetailDto)
  studentDetail: CreateStudentDetailDto;
}
