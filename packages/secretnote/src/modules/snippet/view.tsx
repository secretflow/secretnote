import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Popover, Space, Tooltip, Tree } from 'antd';
import { ChevronDown, MoveRight, Settings2 } from 'lucide-react';

import { CodeBlock } from '@/components/code-block';
import { SideBarContribution } from '@/modules/layout';

import './index.less';
import type { SnippetNode } from './protocol';
import { SnippetService } from './service';

const { DirectoryTree } = Tree;

export const SnippetComponent = () => {
  const instance = useInject<SnippetView>(ViewInstance);
  const service = instance.service;

  const titleRender = (nodeData: SnippetNode) => {
    const isLeaf = nodeData.isLeaf;
    const enabled = instance.service.enabled;

    const onAdd = () => {
      instance.service.addSnippet(nodeData);
    };

    const onConfig = () => {
      instance.service.showConfigModal(nodeData);
    };

    if (!isLeaf) {
      return (
        <div className="secretnote-tree-title">
          <span>{nodeData.title as string}</span>
        </div>
      );
    }

    return (
      <Popover
        placement="rightTop"
        arrow={false}
        overlayStyle={{ maxWidth: 630, paddingTop: 0 }}
        overlayInnerStyle={{ padding: 0 }}
        content={<CodeBlock code={nodeData.code} />}
      >
        <div className="secretnote-tree-title">
          <span>{nodeData.title as string}</span>
          {enabled && (
            <Space>
              <Tooltip title="使用">
                <MoveRight size={14} onClick={onAdd} />
              </Tooltip>
              <Tooltip title="配置">
                <Settings2 size={14} onClick={onConfig} />
              </Tooltip>
            </Space>
          )}
        </div>
      </Popover>
    );
  };

  return (
    <DirectoryTree
      defaultExpandAll
      blockNode
      onSelect={() => {
        //
      }}
      treeData={service.snippets}
      className="secretnote-snippet-tree"
      switcherIcon={<ChevronDown size={12} />}
      icon={null}
      titleRender={titleRender}
    />
  );
};

export const snippetViewKey = 'snippet';
@singleton({ contrib: [SideBarContribution] })
@view('secretnote-snippet-view')
export class SnippetView extends BaseView implements SideBarContribution {
  key = snippetViewKey;
  label = l10n.t('代码片段');
  order = 4;
  defaultOpen = false;
  view = SnippetComponent;
  readonly service: SnippetService;

  constructor(@inject(SnippetService) service: SnippetService) {
    super();
    this.service = service;
  }
}
