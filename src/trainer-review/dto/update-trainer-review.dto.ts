import { PartialType } from '@nestjs/swagger';
import { CreateTrainerReviewDto } from './create-trainer-review.dto';

export class UpdateTrainerReviewDto extends PartialType(
  CreateTrainerReviewDto,
) {}
