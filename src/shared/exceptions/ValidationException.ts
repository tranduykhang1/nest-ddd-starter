import { ExceptionBase, ExceptionDetails } from './ExceptionBase';

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}


export class ValidationException extends ExceptionBase {
  readonly code = 'VALIDATION_ERROR';
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[], details?: ExceptionDetails) {
    const message =
      errors.length === 1
        ? errors[0].message
        : `Validation failed for ${errors.length} fields`;

    super(message, details);
    this.errors = errors;
  }

  static fromField(
    field: string,
    message: string,
    value?: unknown,
  ): ValidationException {
    return new ValidationException([{ field, message, value }]);
  }

  static fromFields(errors: ValidationError[]): ValidationException {
    return new ValidationException(errors);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}
