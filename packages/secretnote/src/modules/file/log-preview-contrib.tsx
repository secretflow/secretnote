import { singleton } from '@difizen/mana-app';
import React from 'react';

import { FilePreviewContribution } from './protocol';

const LogViewer = React.lazy(() => import('@/components/log-viewer'));

@singleton({ contrib: [FilePreviewContribution] })
export class LogPreview implements FilePreviewContribution {
  type = 'log';
  render = (data: string) => {
    return <LogViewer code={data} />;
  };
}
