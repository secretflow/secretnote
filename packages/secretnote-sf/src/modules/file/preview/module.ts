// File preview module for SecretNote.
import { ManaModule } from '@difizen/mana-app';

import { FilePreviewService } from './service';

export const FilePreviewModule = ManaModule.create().register(FilePreviewService);
