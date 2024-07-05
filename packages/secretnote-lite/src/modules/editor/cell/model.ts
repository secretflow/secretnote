import { JupyterCodeCellModel } from '@difizen/libro-jupyter';
import { transient } from '@difizen/mana-app';

@transient()
export class SecretNoteCodeCellModel extends JupyterCodeCellModel {}
