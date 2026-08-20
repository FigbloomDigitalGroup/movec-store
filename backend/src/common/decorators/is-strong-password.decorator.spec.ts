import { validate } from 'class-validator';
import { IsStrongPassword } from './is-strong-password.decorator';

class PasswordDto {
  @IsStrongPassword()
  password: string;

  constructor(password: string) {
    this.password = password;
  }
}

async function isValid(password: string): Promise<boolean> {
  const errors = await validate(new PasswordDto(password));
  return errors.length === 0;
}

describe('IsStrongPassword', () => {
  it('accepts a password with upper, lower, number, and special character', async () => {
    expect(await isValid('Abcdef1!')).toBe(true);
  });

  it('rejects a password with no uppercase letter', async () => {
    expect(await isValid('abcdef1!')).toBe(false);
  });

  it('rejects a password with no lowercase letter', async () => {
    expect(await isValid('ABCDEF1!')).toBe(false);
  });

  it('rejects a password with no digit', async () => {
    expect(await isValid('Abcdefgh!')).toBe(false);
  });

  it('rejects a password with no special character', async () => {
    expect(await isValid('Abcdefg1')).toBe(false);
  });

  it('rejects an empty password', async () => {
    expect(await isValid('')).toBe(false);
  });

  // This decorator only checks character-class complexity, not length — minimum
  // length is expected to be enforced separately (e.g. @MinLength) wherever it's
  // used. Documented here so that contract isn't accidentally assumed or broken.
  it('does not itself enforce a minimum length', async () => {
    expect(await isValid('Aa1!')).toBe(true);
  });
});
