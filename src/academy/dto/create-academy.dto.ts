import {
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
export class CreateAcademyDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsDateString()
  readonly startDate: string;

  @IsNotEmpty()
  @IsDateString()
  readonly endDate: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  readonly price: number;
}
