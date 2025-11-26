import { ValueObject } from './ValueObject.base';
import { InvalidEmailException } from '../../exceptions/CommonExceptions';

interface EmailProps {
  value: string;
}


export class EmailVO extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  private static readonly MAX_LENGTH = 254;
  private static readonly MIN_LENGTH = 5;

  
  private constructor(props: EmailProps) {
    super(props);
  }

 
  static create(email: string): EmailVO {
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail) {
      throw new InvalidEmailException(email);
    }

    if (trimmedEmail.length < EmailVO.MIN_LENGTH) {
      throw new InvalidEmailException(email);
    }

    if (trimmedEmail.length > EmailVO.MAX_LENGTH) {
      throw new InvalidEmailException(email);
    }

    if (!EmailVO.EMAIL_REGEX.test(trimmedEmail)) {
      throw new InvalidEmailException(email);
    }

    return new EmailVO({ value: trimmedEmail });
  }

  static isValid(email: string): boolean {
    try {
      EmailVO.create(email);
      return true;
    } catch {
      return false;
    }
  }

  get value(): string {
    return this.props.value;
  }

  get localPart(): string {
    return this.props.value.split('@')[0];
  }

  get domain(): string {
    return this.props.value.split('@')[1];
  }

  toString(): string {
    return this.value;
  }
}
