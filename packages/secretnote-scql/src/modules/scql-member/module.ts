// This is the members list area displayed on the right side of the top toolbar
// under workspace view.

import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { HeaderArea } from '@/modules/layout';

import { ProjectMemberService } from './service';
import { ProjectMemberView } from './view';

export const SCQLMemberModule = ManaModule.create().register(
  ProjectMemberView,
  ProjectMemberService,
  createViewPreference({
    slot: HeaderArea.right,
    view: ProjectMemberView,
    autoCreate: true,
  }),
);
