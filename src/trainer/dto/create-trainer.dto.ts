import { IsString, IsInt, Min, IsEnum, IsNotEmpty } from 'class-validator';
import { Seniority } from 'src/util/seniority.enum';

export class CreateTrainerDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  readonly age: number;

  @IsNotEmpty()
  @IsEnum(Seniority)
  readonly seniority: Seniority;

  @IsNotEmpty()
  @IsInt()
  readonly academyId: number;
}
