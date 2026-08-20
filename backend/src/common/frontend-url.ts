import { ConfigService } from '@nestjs/config';

// FRONTEND_URL is a comma-separated list of allowed CORS origins (see main.ts),
// not a single URL. Building a link (password reset, email verification, payment
// redirect) needs exactly one origin, so this takes the first entry — the
// canonical/production URL by convention in .env — instead of the raw value,
// which would otherwise produce a malformed multi-origin link.
export function getPrimaryFrontendUrl(configService: ConfigService): string {
  const raw = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  return raw.split(',')[0].trim();
}
