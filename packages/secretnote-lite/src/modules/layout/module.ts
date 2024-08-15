import { createSlotPreference, createViewPreference, ManaModule, RootSlotId } from '@difizen/mana-app';

import { HeaderView } from './header';
import { LayoutArea, LayoutView } from './layout';
import { PreviewLayoutArea, PreviewLayoutView } from './preview';
import { SideBarContribution } from './protocol';
import { AboutBarView, aboutBarViewKey, SideBarView } from './sidebar';

export const LayoutModule = ManaModule.create()
  .contribution(SideBarContribution)
  .register(
    HeaderView,
    SideBarView,
    LayoutView,
    AboutBarView,
    createSlotPreference({
      slot: RootSlotId,
      view: LayoutView,
    }),
    createSlotPreference({
      slot: LayoutArea.header,
      view: HeaderView,
    }),
    createSlotPreference({
      slot: LayoutArea.sidebar,
      view: SideBarView,
    }),
    createViewPreference({
      slot: aboutBarViewKey,
      view: AboutBarView,
      autoCreate: true,
    })
  );

export const PreviewLayoutModule = ManaModule.create().register(
  HeaderView,
  PreviewLayoutView,
  createSlotPreference({
    slot: RootSlotId,
    view: PreviewLayoutView,
  }),
  createSlotPreference({
    slot: PreviewLayoutArea.header,
    view: HeaderView,
  }),
);
