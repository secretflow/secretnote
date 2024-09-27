// The module for SCQL project management web page.

import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { PreviewLayoutArea, HeaderArea } from '@/modules/layout';
import { InvitationNotificationView } from './notification-view';
import { ProjectView } from './view';

export const SCQLProjectModule = ManaModule.create().register(
  ProjectView,
  InvitationNotificationView,
  createViewPreference({
    slot: PreviewLayoutArea.main,
    view: ProjectView,
    autoCreate: true,
  }),
  createViewPreference({
    slot: HeaderArea.right,
    view: InvitationNotificationView,
    autoCreate: true,
  }),
);
