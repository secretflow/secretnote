import { ManaModule } from '@difizen/mana-app';
import { SecretNoteConfigService } from './service';

export const ConfigModule = ManaModule.create().register(SecretNoteConfigService);
