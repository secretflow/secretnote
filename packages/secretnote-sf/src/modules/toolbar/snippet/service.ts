import { NotebookFileService } from '@/modules/notebook';
import { inject, singleton } from '@difizen/mana-app';
import { ISnippet } from './view';

@singleton()
export class SnippetService {
  protected readonly notebookFileService: NotebookFileService;

  constructor(
    @inject(NotebookFileService)
    notebookFileService: NotebookFileService,
  ) {
    this.notebookFileService = notebookFileService;
  }

  /**
   * Append a snippet after the current selected cell.
   */
  addSnippet(snippet: ISnippet) {
    const { currentLibroView } = this.notebookFileService;
    currentLibroView?.addCell(
      {
        cell: {
          cell_type: 'code',
          source: `# ${snippet.label}\n${snippet.code}`,
          metadata: {},
          outputs: [],
          execution_count: null,
        },
      },
      currentLibroView.activeCellIndex + 1,
    );
  }
}
