// File preview module for SecretNote.
import {
  createSlotPreference,
  createViewPreference,
  ManaModule,
} from '@difizen/mana-app';

import { FilePreviewService } from './service';

export const FilePreviewModule = ManaModule.create().register(FilePreviewService);
