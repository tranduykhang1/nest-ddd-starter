import { InvalidPasswordException } from '../exceptions/InvalidPassword.exception';

export class PasswordVO {
  private readonly _value: string;

  constructor(password: string) {
    if (!this.isValidPassword(password)) {
      throw new InvalidPasswordException();
    }
    this._value = password;
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  get value(): string {
    return this._value;
  }
}
