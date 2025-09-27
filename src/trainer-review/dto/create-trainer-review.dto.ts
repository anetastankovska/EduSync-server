import {
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateTrainerReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  readonly grade: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  readonly description: string;
}
