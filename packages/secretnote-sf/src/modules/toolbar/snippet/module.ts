// Code snippet module for SecretNote.
import { ManaModule } from '@difizen/mana-app';

import { SnippetContribution } from './contrib';
import { SnippetService } from './service';

export const SnippetModule = ManaModule.create().register(
  SnippetContribution,
  SnippetService,
);
