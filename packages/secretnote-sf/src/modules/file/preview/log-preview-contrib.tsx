import { singleton } from '@difizen/mana-app';
import React from 'react';

import { FilePreviewContribution } from '../protocol';

@singleton({ contrib: [FilePreviewContribution] })
export class LogPreview implements FilePreviewContribution {
  type = 'log';
  render = (data: string) => {
    return <div>Not Implemented.</div>
  };
}
