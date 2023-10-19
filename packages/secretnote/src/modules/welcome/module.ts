import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { EditorArea } from '@/modules/notebook';

import { WelcomeService } from './service';
import { WelcomeView } from './view';

export const WelcomeModule = ManaModule.create().register(
  WelcomeView,
  WelcomeService,
  createViewPreference({
    slot: EditorArea.welcome,
    view: WelcomeView,
    autoCreate: true,
  }),
);
