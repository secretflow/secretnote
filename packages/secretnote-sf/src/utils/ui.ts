import type { SecretNoteConfigService } from '@/modules/config';

/**
 * Test if the config has readonly flag.
 */
export function isReadonly(configService: SecretNoteConfigService) {
  return !!configService.getItem('readonly');
}

/**
 * Hide when the config has readonly flag.
 */
export function hideWhenReadonly(configService: SecretNoteConfigService) {
  return {
    display: isReadonly(configService) ? 'none' : void 0,
  } as React.CSSProperties;
}

/**
 * Show when the config has readonly flag.
 */
export function showWhenReadonly(configService: SecretNoteConfigService) {
  return {
    display: isReadonly(configService) ? void 0 : 'none',
  } as React.CSSProperties;
}
