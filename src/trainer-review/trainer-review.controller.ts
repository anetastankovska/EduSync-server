import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { TrainerReviewService } from './trainer-review.service';
import { CreateTrainerReviewDto } from './dto/create-trainer-review.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/util/role.enum';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TrainerReview } from './entities/trainer-review.entity';

@ApiTags('TrainerReview')
@ApiBearerAuth()
@Controller('trainer-review')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainerReviewController {
  constructor(private readonly service: TrainerReviewService) {}

  // Students leave a review for a trainer
  @ApiOperation({
    summary: 'Student leaves a review for a trainer (subject-scoped)',
  })
  @Post(':trainerId')
  create(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Body() dto: CreateTrainerReviewDto, // now includes subjectId
    @Req() req: any,
  ) {
    return this.service.createForTrainer(trainerId, req.user.sub, dto);
  }
  // List reviews for a trainer
  @ApiOperation({ summary: 'List reviews for a trainer' })
  @ApiOkResponse({ type: [TrainerReview] })
  @Get(':trainerId')
  @Roles(Role.Trainer, Role.Admin)
  listForTrainer(@Param('trainerId', ParseIntPipe) trainerId: number) {
    return this.service.listForTrainer(trainerId);
  }

  // List reviews by student (current user or specified student id)
  @ApiOperation({ summary: 'List my reviews (student)' })
  @ApiOkResponse({ type: [TrainerReview] })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Defaults to token user',
  })
  @Get('me/trainer-reviews')
  @Roles(Role.Student, Role.Admin)
  listMine(@Req() req: any, @Query('studentId') studentId?: number) {
    const id = studentId ?? req.user.sub;
    return this.service.listByStudent(id);
  }
}
