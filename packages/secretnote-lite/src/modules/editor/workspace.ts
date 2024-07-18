import { BaseWorkspaceService, ILibroWorkspaceService } from '@difizen/libro-jupyter';
import { ApplicationContribution } from '@difizen/mana-app';
import { URI } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

interface JupyterWorkspaceData {
  rootUri: string;
}

@singleton({ contrib: [ILibroWorkspaceService, ApplicationContribution] })
export class JupyterWorkspaceService
  extends BaseWorkspaceService
  implements ILibroWorkspaceService, ApplicationContribution
{
  protected workspaceData: JupyterWorkspaceData = { rootUri: '' };

  onViewStart() {
    this.deferred.resolve();
  }

  override get workspaceRoot() {
    return new URI(this.workspaceData.rootUri);
  }
  override get notebooks() {
    return [];
  }
  override get files() {
    return [];
  }
}
