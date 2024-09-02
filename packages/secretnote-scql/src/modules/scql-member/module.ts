import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { HeaderArea } from '@/modules/layout';

import { MemberService } from './service';
import { MemberView } from './view';

export const SCQLMemberModule = ManaModule.create().register(
  MemberView,
  MemberService,
  createViewPreference({
    slot: HeaderArea.right,
    view: MemberView,
    autoCreate: true,
  }),
);
