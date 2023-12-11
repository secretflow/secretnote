import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { EditorArea } from '@/modules/notebook';

import { WelcomeView } from './view';

export const SCQLWelcomeModule = ManaModule.create().register(
  WelcomeView,
  createViewPreference({
    slot: EditorArea.welcome,
    view: WelcomeView,
    autoCreate: true,
  }),
);
