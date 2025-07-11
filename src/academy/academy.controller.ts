import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AcademyService } from './academy.service';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { Academy } from './entities/academy.entity';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/util/role.enum';

@ApiTags('Academy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academy')
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  @ApiOperation({ summary: 'Retrieves all academies' })
  @ApiOkResponse({
    type: [Academy],
    description: 'All academies retrieved successfully',
  })
  @Get()
  findAll(): Promise<Academy[]> {
    return this.academyService.findAll();
  }

  @ApiOperation({ summary: 'Retrieves academy by id' })
  @ApiOkResponse({
    type: Academy,
    description: 'Academy retrieved successfully',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Academy> {
    return this.academyService.findOne(+id);
  }

  @ApiOperation({ summary: 'Retrieves academy by name' })
  @ApiOkResponse({
    type: [Academy],
    description: 'Academy retrieved successfully',
  })
  // Via path parameters
  @Get('/name/:name')
  async getByName(@Param('name') name: string) {
    return this.academyService.findByName(name);
  }

  @ApiOperation({ summary: 'Creates an academy' })
  @ApiCreatedResponse({
    type: Academy,
    description: 'Academy created successfully',
  })
  @Post()
  @Roles(Role.Admin)
  create(@Body() createAcademyDto: CreateAcademyDto): Promise<Academy> {
    return this.academyService.create(createAcademyDto);
  }

  @ApiOperation({ summary: 'Updates an academy by id' })
  @ApiOkResponse({
    type: Academy,
    description: 'Academy updated successfully',
  })
  @Patch(':id')
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() updateAcademyDto: UpdateAcademyDto,
  ): Promise<Academy> {
    return this.academyService.update(+id, updateAcademyDto);
  }

  @ApiOperation({ summary: 'Deletes an academy by id' })
  @ApiOkResponse({
    description: 'Academy deleted successfully',
  })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      await this.academyService.remove(+id);
      res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Academy successfully removed.',
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Failed to remove academy. ' + error.message,
      });
    }
  }
}
