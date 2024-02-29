import { singleton, prop } from '@difizen/mana-app';

import { request } from '@/utils';

export interface Project {
  id: string;
  name: string;
  description: string;
  creator: string;
  members: string[];
}

export interface Invitation {
  id: string;
  inviter: string;
  invitee: string;
  project: string;
  status: Respond;
}

export enum Respond {
  UNDECIDED = 'UNDECIDED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  INVALID = 'INVALID',
}

export interface PlatformInfo {
  party: string;
  host: string;
}

@singleton()
export class ProjectService {
  @prop()
  projects: Project[] = [];
  @prop()
  invitationList: Invitation[] = [];
  @prop()
  platformInfo: PlatformInfo = { party: '', host: '' };

  async getPlatformInfo() {
    const platformInfo = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getPlatformInfo',
      }),
    });
    this.platformInfo = platformInfo;
    return platformInfo;
  }

  async getProjectList() {
    const projectList = await request('api/broker', {
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
    await request('api/broker', {
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
    const invitationList = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getInvitationList',
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.invitationList = invitationList.map((item: any) => ({
      status: item.status,
      id: item.invitation_id,
      inviter: item.inviter,
      invitee: item.invitee,
      project: item.project.name || item.project.project_id,
    }));
    return invitationList;
  }

  async processInvitation(invitationId: string, accepted: boolean) {
    await request('api/broker', {
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
