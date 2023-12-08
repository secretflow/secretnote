import { singleton, prop, inject } from '@difizen/mana-app';

import { RequestService } from '@/modules/request';

export interface Project {
  id: string;
  name: string;
  description: string;
  creator: string;
  members: string[];
}

export interface Invitation {
  accepted: number;
  id: string;
  inviter: string;
  project: string;
}

export enum Respond {
  Pending = 0,
  Accepted = 1,
  Declined = -1,
}

export interface PlatformInfo {
  party: string;
  host: string;
}

@singleton()
export class ProjectService {
  protected readonly requestService: RequestService;

  @prop()
  projects: Project[] = [];
  @prop()
  invitationList: Invitation[] = [];
  @prop()
  platformInfo: PlatformInfo = { party: '', host: '' };

  constructor(@inject(RequestService) requestService: RequestService) {
    this.requestService = requestService;
  }

  async getPlatformInfo() {
    const platformInfo = await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getPlatformInfo',
      }),
    });
    this.platformInfo = platformInfo;
    return platformInfo;
  }

  async getProjectList() {
    const projectList = await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getProjectList',
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = projectList.map((item: any) => ({
      id: item.project_id,
      name: item.name || item.project_id,
      description: item.description,
      creator: item.creator,
      members: item.members,
    }));
    projects.sort((a: Project, b: Project) => a.name.localeCompare(b.name));
    this.projects = projects;

    return this.projects;
  }

  async addProject(project: Partial<Project>) {
    await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'addProject',
        project_id: project.id,
        name: project.name,
        description: project.description,
      }),
    });
    this.getProjectList();
  }

  async getInvitationList() {
    const invitationList = await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getInvitationList',
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.invitationList = invitationList.map((item: any) => ({
      accepted: item.accepted,
      id: item.invitation_id,
      inviter: item.inviter,
      project: item.project.name || item.project.project_id,
    }));
    return invitationList;
  }

  async processInvitation(invitationId: string, accepted: boolean) {
    await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'processInvitation',
        invitation_id: invitationId,
        respond: accepted ? 'ACCEPT' : 'DECLINE',
      }),
    });
    this.getInvitationList();
    this.getProjectList();
  }
}
