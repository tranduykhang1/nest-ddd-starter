import { InvalidEmailException } from '../../exceptions/CommonExceptions';
import { EmailVO } from './Email.vo';

describe("EmailVO Value Object'", () => {
  describe('create()', () => {
    describe('valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@example.org',
        'user@subdomain.example.com',
        'first.last@example.co.uk',
        'email@123.123.123.123',
        'email@domain-with-dash.com',
        '1234567890@example.com',
        '_______@example.com',
        'TEST@EXAMPLE.COM',
        '  test@example.com  ', // Should be trimmed
      ];

      it.each(validEmails)('should create Email for: %s', (emailStr) => {
        const email = EmailVO.create(emailStr);
        expect(email).toBeInstanceOf(EmailVO);
        expect(email.value).toBe(emailStr.trim().toLowerCase());
      });
    });

    describe('invalid emails', () => {
      it('should throw for empty string', () => {
        expect(() => EmailVO.create('')).toThrow(InvalidEmailException);
      });

      it('should throw for whitespace only', () => {
        expect(() => EmailVO.create('   ')).toThrow(InvalidEmailException);
      });

      it('should throw for null/undefined', () => {
        expect(() => EmailVO.create(null as any)).toThrow(
          InvalidEmailException,
        );
        expect(() => EmailVO.create(undefined as any)).toThrow(
          InvalidEmailException,
        );
      });

      it('should throw for email without @', () => {
        expect(() => EmailVO.create('testexample.com')).toThrow(
          InvalidEmailException,
        );
      });

      it('should throw for email without domain', () => {
        expect(() => EmailVO.create('test@')).toThrow(InvalidEmailException);
      });

      it('should throw for email without local part', () => {
        expect(() => EmailVO.create('@example.com')).toThrow(
          InvalidEmailException,
        );
      });

      it('should throw for email with spaces', () => {
        expect(() => EmailVO.create('test @example.com')).toThrow(
          InvalidEmailException,
        );
        expect(() => EmailVO.create('test@ example.com')).toThrow(
          InvalidEmailException,
        );
      });

      it('should throw for email too short', () => {
        expect(() => EmailVO.create('a@b')).toThrow(InvalidEmailException);
      });

      it('should throw for email too long', () => {
        const longLocal = 'a'.repeat(250);
        const longEmail = `${longLocal}@example.com`;
        expect(() => EmailVO.create(longEmail)).toThrow(InvalidEmailException);
      });
    });
  });

  describe('isValid()', () => {
    it('should return true for valid email', () => {
      expect(EmailVO.isValid('test@example.com')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(EmailVO.isValid('invalid')).toBe(false);
      expect(EmailVO.isValid('')).toBe(false);
      expect(EmailVO.isValid('test@')).toBe(false);
    });
  });

  describe('properties', () => {
    it('should return correct value', () => {
      const email = EmailVO.create('Test@Example.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('should return correct localPart', () => {
      const email = EmailVO.create('user.name@example.com');
      expect(email.localPart).toBe('user.name');
    });

    it('should return correct domain', () => {
      const email = EmailVO.create('user@subdomain.example.com');
      expect(email.domain).toBe('subdomain.example.com');
    });

    it('should return string via toString()', () => {
      const email = EmailVO.create('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const email = EmailVO.create('test@example.com');
      expect(() => {
        (email as any).props.value = 'hacked@example.com';
      }).toThrow();
    });
  });

  describe('equality', () => {
    it('should return true for emails with same value', () => {
      const email1 = EmailVO.create('test@example.com');
      const email2 = EmailVO.create('TEST@EXAMPLE.COM');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for emails with different values', () => {
      const email1 = EmailVO.create('test1@example.com');
      const email2 = EmailVO.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      const email = EmailVO.create('test@example.com');
      expect(email.equals(null as any)).toBe(false);
      expect(email.equals(undefined as any)).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const email = EmailVO.create('test@example.com');
      expect(email.toJSON()).toEqual({ value: 'test@example.com' });
    });
  });
});
