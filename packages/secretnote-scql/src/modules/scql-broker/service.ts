// Service for interacting with backend's broker APIs.
// @see https://www.secretflow.org.cn/zh-CN/docs/scql/0.9.0b1/reference/broker-api
// The schema follows the document, best effort.

import { request } from '@/utils';
import { prop, singleton } from '@difizen/mana-app';

// APIs of SCQL Broker.
export enum BrokerActions {
  getPlatformInfo = 'getPlatformInfo',
  listProjects = 'listProjects',
  createProject = 'createProject',
  getProjectInfo = 'getProjectInfo',
  listInvitations = 'listInvitations',
  processInvitation = 'processInvitation',
  inviteMember = 'inviteMember',
  listTables = 'listTables',
  createTable = 'createTable',
  dropTable = 'dropTable',
  showCCL = 'showCCL',
  grantCCL = 'grantCCL',
  doQuery = 'doQuery',
}

export enum _ProjectInvitationStatus {
  UNDECIDED = 'UNDECIDED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

// spu.RuntimeConfig
export type _SPURuntimeConfig = {
  protocol: 'PROT_INVALID' | 'REF2K' | 'SEMI2K' | 'ABY3' | 'CHEETAH' | 'SECURENN';
  field: 'FT_INVALID' | 'FM32' | 'FM64' | 'FM128';
};

// scql.pb.ProjectConfig
export type ProjectConfig = {
  spu_runtime_cfg: _SPURuntimeConfig;
} & {
  [key: string]: any;
};

// scql.pb.ProjectDesc
export type ProjectDesc = {
  project_id: string;
  name: string;
  description: string;
  conf: ProjectConfig;
  creator: string;
  members: string[];
};

export type _ProjectInvitationRespond = 'ACCEPT' | 'DECLINE';

// scql.pb.ProjectInvitation
export type ProjectInvitation = {
  invitation_id: string;
  inviter: string;
  invitee: string;
  project: ProjectDesc;
  status: _ProjectInvitationStatus;
};

// defined by ourself
export type _PlatformInfo = {
  party: string; // self party
  broker: string; // address of broker API
};

@singleton()
export class SCQLBrokerService {
  @prop() platformInfo: _PlatformInfo = { party: '', broker: '' };
  @prop() projects: ProjectDesc[] = [];
  @prop() invitations: ProjectInvitation[] = [];

  constructor() {
    this.getPlatformInfo();
    this.listProjects();
    this.listInvitations();
  }

  /**
   * Get the platform info.
   * Update in place and return.
   */
  async getPlatformInfo() {
    return (this.platformInfo = await request<_PlatformInfo>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: BrokerActions.getPlatformInfo,
      }),
    }));
  }

  /**
   * List All Projects that have created and joined.
   * If `projectId` is not given, return all projects.
   * Update in place and return.
   */
  async listProjects(projectId?: string) {
    return (this.projects = await request<ProjectDesc[]>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: BrokerActions.listProjects,
        ids: projectId ? [projectId] : [],
      }),
    }));
  }

  /**
   * Create a new Project and automatically become the Project member and creator.
   */
  async createProject(
    project: Pick<ProjectDesc, 'project_id' | 'name' | 'description' | 'conf'>,
  ) {
    await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: BrokerActions.createProject,
        ...project,
      }),
    });
  }

  /**
   * List all invitations sent and received.
   * Update in place and return.
   */
  async listInvitations(status?: _ProjectInvitationStatus, inviter?: string) {
    return (this.invitations = await request<ProjectInvitation[]>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: BrokerActions.listInvitations,
        status,
        inviter,
      }),
    }));
  }

  /**
   * Process the received invitation, specify it by invitation_id, choose to join the corresponding project or reject it
   */
  async processInvitation(invitationId: string, respond: _ProjectInvitationRespond) {
    return await request<{}>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: BrokerActions.processInvitation,
        invitation_id: invitationId,
        respond,
      }),
    });
  }
}
