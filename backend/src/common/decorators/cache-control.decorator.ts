import { SetMetadata } from '@nestjs/common';

export const CACHE_CONTROL_KEY = 'cache_control';
export const CacheControl = (headerValue: string) =>
  SetMetadata(CACHE_CONTROL_KEY, headerValue);
