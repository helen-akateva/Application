import { Injectable, BadRequestException } from '@nestjs/common';
import { In, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

const COLORS = [
  '#F43F5E',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#14B8A6',
  '#6366F1',
  '#EAB308',
  '#EC4899',
  '#22C55E',
];

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }

  async findByIds(ids: number[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return this.tagsRepository.findBy({ id: In(ids) });
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const normalized = dto.name.toLowerCase().trim();

    const existing = await this.tagsRepository.findOne({
      where: { name: ILike(normalized) },
    });

    if (existing) {
      throw new BadRequestException('Tag with this name already exists');
    }

    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const tag = this.tagsRepository.create({
      ...dto,
      name: normalized,
      color: dto.color ?? randomColor,
    });
    return this.tagsRepository.save(tag);
  }
}
