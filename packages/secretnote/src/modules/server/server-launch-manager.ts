import { ServerLaunchManager } from '@difizen/libro-jupyter';
import { inject, singleton, ApplicationContribution } from '@difizen/mana-app';

import { SecretNoteServerManager } from './server-manager';

@singleton({ contrib: [ServerLaunchManager, ApplicationContribution] })
export class SecretNoteServerLaunchManager
  implements ServerLaunchManager, ApplicationContribution
{
  protected serverManager: SecretNoteServerManager;
  constructor(
    @inject(SecretNoteServerManager)
    serverManager: SecretNoteServerManager,
  ) {
    this.serverManager = serverManager;
  }

  onStart() {
    this.launch();
  }

  launch() {
    return this.serverManager.startServices();
  }
}
