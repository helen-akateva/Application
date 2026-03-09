import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError, type AnyObjectSchema } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private schema: AnyObjectSchema) {}

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      const validatedValue: unknown = await this.schema.validate(value, {
        abortEarly: false,
        stripUnknown: true,
      });
      return validatedValue;
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: err.errors || [],
        });
      }

      throw new BadRequestException({
        message: 'Validation failed',
        errors: [(err as Error).message],
      });
    }
  }
}
