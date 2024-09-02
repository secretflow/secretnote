import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { SnippetService } from './service';
import { SnippetView, snippetViewKey } from './view';

export const SnippetModule = ManaModule.create().register(
  SnippetView,
  SnippetService,
  createViewPreference({
    slot: snippetViewKey,
    view: SnippetView,
    autoCreate: true,
  }),
);
