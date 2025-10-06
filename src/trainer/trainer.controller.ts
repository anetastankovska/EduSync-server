import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { Response } from 'express';
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Trainer } from './entities/trainer.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('Trainer')
@ApiBearerAuth()
@Controller('trainer')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get my trainer profile (by JWT user id)' })
  @ApiOkResponse({ type: Trainer, description: 'Trainer loaded' })
  getMe(@Req() req: any) {
    return this.trainerService.findByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Update my trainer profile' })
  @ApiOkResponse({ type: Trainer, description: 'Trainer updated' })
  updateMe(@Req() req: any, @Body() dto: UpdateTrainerDto) {
    return this.trainerService.updateByUserId(req.user.userId, dto);
  }

  @ApiOperation({
    summary:
      'Retrieves all trainers. Optionally filter by name, academyId, and seniority',
  })
  @ApiOkResponse({ type: [Trainer], description: 'Trainers retrieved' })
  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'academyId', required: false })
  @ApiQuery({ name: 'seniority', required: false })
  findAll(
    @Query('name') name?: string,
    @Query('academyId') academyId?: number,
    @Query('seniority') seniority?: string,
  ) {
    return this.trainerService.findAll(
      name,
      academyId ? Number(academyId) : undefined,
      seniority,
    );
  }

  @ApiOperation({ summary: 'Creates a trainer' })
  @ApiCreatedResponse({ type: Trainer, description: 'Trainer created' })
  @Post()
  create(@Body() dto: CreateTrainerDto) {
    return this.trainerService.create(dto);
  }

  @ApiOperation({ summary: 'Retrieves a trainer by id' })
  @ApiOkResponse({ type: Trainer, description: 'Trainer retrieved' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainerService.findOne(id);
  }

  @ApiOperation({ summary: 'Updates a trainer by id' })
  @ApiOkResponse({ type: Trainer, description: 'Trainer updated' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainerDto) {
    return this.trainerService.update(id, dto);
  }

  @ApiOperation({ summary: 'Deletes a trainer by id' })
  @ApiOkResponse({ description: 'Trainer deleted' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      await this.trainerService.remove(id);
      res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Trainer successfully removed.',
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Failed to remove trainer. ' + error.message,
      });
    }
  }

  @Patch(':id/academy')
  updateAcademy(@Param('id', ParseIntPipe) id: number, @Body() dto) {
    // dto.academyId may be undefined (meaning null) or a number
    const academyId = dto.academyId ?? null;
    return this.trainerService.setAcademy(id, academyId);
  }

  @Put(':id/subjects')
  setSubjects(@Param('id', ParseIntPipe) id: number, @Body() dto) {
    return this.trainerService.setSubjects(id, dto.subjectIds ?? []);
  }
}
