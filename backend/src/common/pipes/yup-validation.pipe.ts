import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import type { AnyObjectSchema, ValidationError } from 'yup';

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
      const validationError = err as ValidationError;
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationError.errors || [],
      });
    }
  }
}
