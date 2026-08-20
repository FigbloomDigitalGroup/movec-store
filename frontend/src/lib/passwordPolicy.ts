// Mirrors backend/src/common/decorators/is-strong-password.decorator.ts exactly,
// so the client can catch a weak password before the API round-trip instead of
// only after a 400 the user was never warned about.
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/;

export const PASSWORD_REQUIREMENTS_HINT =
  '8-50 characters, with uppercase, lowercase, a number, and a special character.';

export function getPasswordError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 50) return 'Password must be at most 50 characters.';
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return 'Password must contain uppercase, lowercase, number, and special character.';
  }
  return null;
}
