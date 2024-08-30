import { RenderMimeContribution } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/mana-app';

import { SQLOutputRender } from './output-render';

@singleton({ contrib: RenderMimeContribution })
export class SQLOutputMimeTypeContribution implements RenderMimeContribution {
  canHandle = () => {
    return 100;
  };

  renderType = 'SQLOutputRender';
  safe = true;
  mimeTypes = ['application/vnd.libro.sql+json'];
  render = SQLOutputRender;
}
