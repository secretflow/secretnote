// Code snippet module for SecretNote.
import { ManaModule } from '@difizen/mana-app';

import { SnippetContribution } from './contrib';

export const SnippetModule = ManaModule.create().register(SnippetContribution);
