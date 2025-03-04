// The module for SCQL project management web page.

import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { HeaderArea, PreviewLayoutArea } from '@/modules/layout';
import { SCQLBrokerModule } from '@/modules/scql-broker';
import { InvitationNotificationView } from '@/modules/scql-project/notification-view';
import { ProjectService } from '@/modules/scql-project/service';
import { ProjectView } from '@/modules/scql-project/view';

export const SCQLProjectModule = ManaModule.create()
  .register(
    ProjectView,
    ProjectService,
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
  )
  .dependOn(SCQLBrokerModule);
