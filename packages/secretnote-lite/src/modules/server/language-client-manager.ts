/**
 * The language client manager shipped with Libro cannot handle the token
 * for WebSocket authentication. So we need to customize it to append the token
 * according to settings of ServerConnection.
 */

import { ServerConnection } from '@difizen/libro-jupyter';
import { LibroLanguageClientManager } from '@difizen/libro-language-client';
import { inject, singleton } from '@difizen/mana-app';

@singleton({ token: LibroLanguageClientManager }) // overrides the default LibroLanguageClientManager
export class SecretNoteLanguageClientManager extends LibroLanguageClientManager {
  protected readonly serverConnection: ServerConnection;

  constructor(@inject(ServerConnection) serverConnection: ServerConnection) {
    super();
    this.serverConnection = serverConnection;
  }

  /**
   * Get the URI for a certain language server with token appended if needed.
   */
  protected override serverUri(languageServerId: string) {
    const tokenPart = this.serverConnection.settings.appendToken
      ? `?token=${this.serverConnection.settings.token}`
      : '';
    return super.serverUri(languageServerId) + tokenPart;
  }
}
