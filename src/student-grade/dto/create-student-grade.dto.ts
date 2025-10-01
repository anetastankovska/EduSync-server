import { IsString, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateStudentGradeDto {
  @IsInt()
  @Min(1)
  @Max(5)
  readonly grade: number;

  @IsString()
  @MaxLength(255)
  readonly description: string;

  @IsInt()
  readonly subjectId: number;
}
