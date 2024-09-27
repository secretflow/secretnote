import { ManaModule } from '@difizen/mana-app';
import { SCQLBrokerService } from './service';

export const SCQLBrokerModule = ManaModule.create().register(SCQLBrokerService);
