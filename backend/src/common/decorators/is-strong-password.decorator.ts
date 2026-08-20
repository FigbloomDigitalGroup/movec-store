import { Matches } from 'class-validator';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/;
const STRONG_PASSWORD_MESSAGE =
  'Password must contain uppercase, lowercase, number, and special character';

/**
 * Single source of truth for the password-complexity policy, so it can't
 * silently apply to registration only while reset/change/admin-create paths
 * accept anything of the right length.
 */
export function IsStrongPassword() {
  return Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE });
}
