export interface ExceptionDetails {
  [key: string]: unknown;
}

export abstract class ExceptionBase extends Error {
  abstract readonly code: string;
  readonly details?: ExceptionDetails;
  readonly timestamp: Date;

  constructor(
    message: string,
    details?: ExceptionDetails,
  ) {
    super(message);
    this.details = details;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.constructor.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
