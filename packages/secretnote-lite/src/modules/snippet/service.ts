import {
  inject,
  ModalContribution,
  ModalService,
  prop,
  singleton,
} from '@difizen/mana-app';

import { NotebookFileService } from '@/modules/notebook';

import { snippets } from './data';
import { SnippetConfigModal } from './modal';
import type { Snippet, SnippetNode } from './protocol';

@singleton({ contrib: [ModalContribution] })
export class SnippetService implements ModalContribution {
  private readonly notebookFileService: NotebookFileService;
  private readonly modalService: ModalService;

  @prop()
  snippets: SnippetNode[] = [];

  get enabled(): boolean {
    return !!this.notebookFileService.currentLibroView;
  }

  constructor(
    @inject(ModalService) modalService: ModalService,
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
  ) {
    this.modalService = modalService;
    this.notebookFileService = notebookFileService;
    this.snippets = this.transDataToTree(snippets);
  }

  transDataToTree(data: Snippet[]): SnippetNode[] {
    const tree: SnippetNode[] = [];
    const map: Record<string, SnippetNode> = {};

    data.forEach((item) => {
      const node: SnippetNode = {
        ...item,
        isLeaf: true,
        children: [],
      };

      if (!map[item.type]) {
        const parentNode = {
          key: item.type,
          title: item.type,
          type: item.type,
          code: '',
          isLeaf: false,
          children: [node],
        };
        tree.push(parentNode);
        map[item.type] = parentNode;
      } else {
        map[item.type]?.children?.push(node);
      }
    });

    return tree;
  }

  addSnippet(snippet: Snippet) {
    const { currentLibroView } = this.notebookFileService;
    if (currentLibroView) {
      currentLibroView.addCell({
        cell: {
          cell_type: 'code',
          source: snippet.code,
          metadata: {},
          outputs: [],
          execution_count: null,
        },
      });
    }
  }

  showConfigModal(nodeData: SnippetNode) {
    this.modalService.openModal<SnippetNode>(SnippetConfigModal, nodeData);
  }

  registerModal() {
    return SnippetConfigModal;
  }
}
