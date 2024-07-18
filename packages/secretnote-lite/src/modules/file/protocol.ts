import { Syringe } from '@difizen/mana-app';

export const FilePreviewContribution = Syringe.defineToken('FilePreviewContribution');
export interface FilePreviewContribution {
  type: string;
  render: (data: string) => React.ReactElement;
}
