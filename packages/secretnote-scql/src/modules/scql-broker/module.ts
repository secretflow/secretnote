import { ManaModule } from '@difizen/mana-app';
import { BrokerService } from './service';

export const SCQLBrokerModule = ManaModule.create().register(BrokerService);
