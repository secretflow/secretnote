import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
  ModalService,
  ModalContribution,
} from '@difizen/mana-app';
import { Table, Input, Button } from 'antd';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { history } from 'umi';

import './index.less';
import { ProjectConfigModal } from './add-modal';
import { ProjectService, type Project } from './service';

export const ProjectComponent = () => {
  const instance = useInject<ProjectView>(ViewInstance);
  const [searchWords, setSearchWords] = useState<string>('');
  const filteredProjects = instance.service.projects.filter(
    (project) => project.name.includes(searchWords) || searchWords === '',
  );

  const enterProject = (projectId: string) => {
    history.push('/scql/project/' + projectId);
  };

  return (
    <div className="project-container">
      <div className="toolbar">
        <Input
          placeholder="Filter name"
          prefix={<Search color="#5b768f" size={16} />}
          style={{ width: 320 }}
          value={searchWords}
          onChange={(e) => setSearchWords(e.target.value)}
          allowClear
        />
        <Button type="primary" onClick={() => instance.openAddProjectModal()}>
          Add New Project
        </Button>
      </div>
      <div>
        <Table
          dataSource={filteredProjects}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'Host',
              dataIndex: 'creator',
              key: 'creator',
            },
            {
              title: 'Member',
              dataIndex: 'members',
              key: 'members',
              render: (members: string[]) => members.join(', '),
            },
            {
              title: 'Description',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: 'Action',
              dataIndex: 'action',
              key: 'action',
              render: (_: any, record: Project) => (
                <Button type="link" onClick={() => enterProject(record.id)}>
                  Enter
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

@singleton({ contrib: [ModalContribution] })
@view('scql-project-view')
export class ProjectView extends BaseView implements ModalContribution {
  view = ProjectComponent;
  readonly service: ProjectService;
  readonly modalService: ModalService;

  constructor(
    @inject(ProjectService) service: ProjectService,
    @inject(ModalService) modalService: ModalService,
  ) {
    super();
    this.service = service;
    this.modalService = modalService;
  }

  async onViewMount() {
    this.service.getProjectList();
  }

  openAddProjectModal() {
    this.modalService.openModal(ProjectConfigModal);
  }

  registerModal() {
    return ProjectConfigModal;
  }
}
