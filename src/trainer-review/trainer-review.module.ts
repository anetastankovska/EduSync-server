import { Module } from '@nestjs/common';
import { TrainerReviewService } from './trainer-review.service';
import { TrainerReviewController } from './trainer-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerReview } from './entities/trainer-review.entity';
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Subject } from 'src/subject/entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainerReview, Student, Trainer, Subject]),
  ],
  providers: [TrainerReviewService],
  controllers: [TrainerReviewController],
  exports: [TypeOrmModule, TrainerReviewService],
})
export class TrainerReviewModule {}
