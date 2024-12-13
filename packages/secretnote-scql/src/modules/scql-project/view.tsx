// The view component of SCQL project list page.

import {
  BaseView,
  inject,
  ModalContribution,
  ModalService,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Button, Flex, Input, Table, Typography } from 'antd';
import { ArrowRight, KanbanSquare, Search } from 'lucide-react';
import { useState } from 'react';

import { BrokerService } from '@/modules/scql-broker';
import { ProjectConfigModal } from '@/modules/scql-project/add-modal';
import { ProjectService } from '@/modules/scql-project/service';
import { genericErrorHandler } from '@/utils';
import './index.less';

export const ProjectComponent = () => {
  const instance = useInject<ProjectView>(ViewInstance);
  const { projectService } = instance;

  // search by project name
  const [searchWords, setSearchWords] = useState<string>('');
  const filteredProjects = projectService.projects.filter(
    (project) => project.name.includes(searchWords) || searchWords === '',
  );

  /**
   * Go into the workspace of a project.
   */
  const handleEnterProject = (projectId: string) =>
    (location.href = location.origin + `/secretnote/workspace/${projectId}`);

  return (
    <div className="project-container">
      <div className="toolbar">
        <Input
          placeholder={l10n.t('用名称搜索')}
          prefix={<Search color="#5b768f" size={16} />}
          style={{ width: 280 }}
          value={searchWords}
          onChange={(e) => setSearchWords(e.target.value)}
          allowClear
        />
        <Button type="primary" onClick={() => instance.openCreateProjectModal()}>
          {l10n.t('新建项目')}
        </Button>
      </div>
      <div className="content">
        <Table
          dataSource={filteredProjects}
          rowKey="id"
          pagination={
            filteredProjects.length > 15 ? { pageSize: 10, size: 'small' } : false
          }
          columns={[
            {
              title: l10n.t('项目名'),
              dataIndex: 'name',
              key: 'name',
              render: (name: string) => (
                <span className="project-name">
                  <KanbanSquare size={14} style={{ marginRight: 8 }} />
                  <span>{name}</span>
                </span>
              ),
            },
            {
              title: l10n.t('主机 (Host)'),
              dataIndex: 'creator',
              key: 'creator',
            },
            {
              title: l10n.t('成员 (Members)'),
              dataIndex: 'members',
              key: 'members',
              render: (members: string[]) => members.join(', '),
            },
            {
              title: l10n.t('项目描述'),
              dataIndex: 'description',
              key: 'description',
              render: (description: string) => description || '-',
            },
            {
              title: l10n.t('操作'),
              dataIndex: 'action',
              key: 'action',
              render: (_, record) => (
                <Button
                  icon={<ArrowRight size={16} />}
                  onClick={() => handleEnterProject(record.project_id)}
                  type="link"
                  size="small"
                >
                  {l10n.t('进入')}
                </Button>
              ),
            },
          ]}
        />
      </div>
      <Flex justify="center" gap={'1em'} style={{ paddingTop: '12px' }}>
        <Typography.Link href="https://www.secretflow.org.cn/" target="_blank">
          SecretFlow
        </Typography.Link>
        <Typography.Link
          href="https://github.com/secretflow/secretnote"
          target="_blank"
        >
          SecretNote
        </Typography.Link>
        <Typography.Link href="https://studio.secretflow.com" target="_blank">
          隐语实训平台
        </Typography.Link>
      </Flex>
    </div>
  );
};

@singleton({ contrib: [ModalContribution] })
@view('scql-project-view')
export class ProjectView extends BaseView implements ModalContribution {
  view = ProjectComponent;
  readonly brokerService: BrokerService;
  readonly projectService: ProjectService;
  readonly modalService: ModalService;

  constructor(
    @inject(BrokerService) brokerService: BrokerService,
    @inject(ProjectService) projectService: ProjectService,
    @inject(ModalService) modalService: ModalService,
  ) {
    super();
    this.brokerService = brokerService;
    this.projectService = projectService;
    this.modalService = modalService;
  }

  async onViewMount() {
    // validate the runtime arguments
    try {
      await this.brokerService.refreshPlatformInfo();
      (['party', 'broker'] as const).forEach((v) => {
        if (!this.brokerService.platformInfo[v]) {
          throw new Error(l10n.t(`运行时参数 {0} 未指定，应用可能无法完整运行`, v));
        }
      });
    } catch (e) {
      genericErrorHandler(e);
    }
    this.projectService.refreshProjects();
  }

  openCreateProjectModal() {
    this.modalService.openModal(ProjectConfigModal);
  }

  registerModal() {
    // register the modal to the registry shipped with Mana
    return ProjectConfigModal;
  }
}
