import { IsString, IsInt, Min, IsNotEmpty, Max } from 'class-validator';
export class CreateTrainerReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  readonly grade: number;

  @IsNotEmpty()
  @IsString()
  readonly description: string;
}
