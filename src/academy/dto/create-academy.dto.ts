import {
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
export class CreateAcademyDto {
  // @ApiProperty({
  //   type: string
  // })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  // @ApiProperty({
  //   description: 'Starting date of the academy',
  //   example: '2024-11-01',
  //   // If we do not set the type below in the property, we can set it for swagger only
  //   // If we set the type below, it will infer the type and we don't have to explicitly set the type in swagger
  //   // type: 'string',
  //   // format: 'date-time'
  // })
  @IsNotEmpty()
  @IsDateString()
  readonly startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly endDate: Date;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  readonly price: number;
}
