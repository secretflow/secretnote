// Module for the layout of the whole page.

import { createSlotPreference, ManaModule, RootSlotId } from '@difizen/mana-app';

import { HeaderView } from './header';
import { LayoutArea, LayoutView } from './layout';
import { PreviewLayoutArea, PreviewLayoutView } from './preview';
import { SideBarContribution } from './protocol';
import { SideBarView } from './sidebar';

/**
 * The common layout module with header, sidebar and content.
 */
export const LayoutModule = ManaModule.create()
  .contribution(SideBarContribution)
  .register(
    HeaderView,
    SideBarView,
    LayoutView,
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
  );

/**
 * The preview layout with header and content but without sidebar.
 * Used in file preview and SCQL project page.
 */
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
