// Service for interacting with backend's broker APIs.
// @see https://www.secretflow.org.cn/zh-CN/docs/scql/0.9.0b1/reference/broker-api
// The schema follows the document, best effort.

import { request } from '@/utils';
import { singleton } from '@difizen/mana-app';

@singleton()
export class SCQLBrokerService {
  /**
   * Get the platform info.
   */
  async getPlatformInfo() {
    return await request<SCQL._PlatformInfo>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: SCQL.BrokerActions.getPlatformInfo,
      }),
    });
  }

  /**
   * List All Projects that have created and joined.
   * If `projectId` is not given, return all projects.
   */
  async listProjects(projectId?: string) {
    return await request<SCQL.ProjectDesc[]>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: SCQL.BrokerActions.listProjects,
        project_id: projectId,
      }),
    });
  }

  /**
   * Create a new Project and automatically become the Project member and creator.
   */
  async createProject(
    project: Pick<SCQL.ProjectDesc, 'project_id' | 'name' | 'description' | 'conf'>,
  ) {
    await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: SCQL.BrokerActions.createProject,
        ...project,
      }),
    });
  }

  /**
   * List all invitations sent and received.
   */
  async listInvitations(status?: SCQL._ProjectInvitationStatus, inviter?: string) {
    return await request<SCQL.ProjectInvitation[]>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: SCQL.BrokerActions.listInvitations,
        status,
        inviter,
      }),
    });
  }

  /**
   * Process the received invitation, specify it by invitation_id, choose to join the corresponding project or reject it
   */
  async processInvitation(
    invitationId: string,
    respond: 'ACCEPT' | 'DECLINE' | undefined = 'ACCEPT',
  ) {
    return await request<{}>('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: SCQL.BrokerActions.processInvitation,
        invitation_id: invitationId,
        respond,
      }),
    });
  }
}
