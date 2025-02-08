// Module for the layout of the whole page.

import { createSlotPreference, ManaModule, RootSlotId } from '@difizen/mana-app';

import { HeaderView } from './header';
import { LayoutArea, LayoutView } from './layout';
import { SideBarContribution } from './protocol';
import { AboutBarView, aboutBarViewKey, SideBarView } from './sidebar';

/**
 * The common layout module with header, sidebar and content.
 */
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
    createSlotPreference({
      slot: aboutBarViewKey,
      view: AboutBarView,
    }),
  );
