import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Difficulty } from 'src/util/difficulty.enum';

// Global swagger configured in nest-cli.json
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
}
