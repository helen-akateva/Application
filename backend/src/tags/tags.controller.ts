import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { CreateTagDto } from './dto/create-tag.dto';
import { createTagSchema } from './schemas/create-tag.schema';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'List of all available tags' })
  findAll() {
    return this.tagsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or tag already exists',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @UsePipes(new YupValidationPipe(createTagSchema))
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }
}
