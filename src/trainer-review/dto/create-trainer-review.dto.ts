import { IsString, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateTrainerReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  readonly grade: number;

  @IsString()
  @MaxLength(500)
  readonly description: string;

  @IsInt()
  readonly subjectId: number;
}
