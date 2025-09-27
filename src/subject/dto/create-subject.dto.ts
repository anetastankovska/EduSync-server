import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Difficulty } from 'src/util/difficulty.enum';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  readonly numberOfClasses: number;

  @IsNotEmpty()
  @IsEnum(Difficulty)
  readonly difficulty: Difficulty;

  @IsInt()
  @IsNotEmpty()
  readonly academyId: number;

  @IsInt()
  @IsNotEmpty()
  readonly trainerId: number; // NEW
}
