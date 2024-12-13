// Service related to projects and invitations.

import { inject, prop, singleton } from '@difizen/mana-app';
import {
  _ProjectInvitationStatus,
  BrokerService,
  ProjectDesc,
  ProjectInvitation,
} from '@/modules/scql-broker';

@singleton()
export class ProjectService {
  protected readonly brokerService: BrokerService;
  @prop() projects: ProjectDesc[] = [];
  @prop() invitations: ProjectInvitation[] = [];

  constructor(@inject(BrokerService) brokerService: BrokerService) {
    this.brokerService = brokerService;
  }

  /**
   * List All Projects that have created and joined.
   * If `projectId` is not given, return all projects.
   * Update in place and return.
   */
  async refreshProjects(projectId?: string) {
    return (this.projects = await this.brokerService.listProjects(projectId));
  }

  /**
   * List all invitations sent and received.
   * Update in place and return.
   */
  async refreshInvitations(status?: _ProjectInvitationStatus, inviter?: string) {
    return (this.invitations = await this.brokerService.listInvitations(
      status,
      inviter,
    ));
  }

  /**
   * Get project info by project id.
   */
  async getProjectInfo(projectId: string) {
    const projects = await this.brokerService.listProjects(projectId);
    return projects.length > 0 ? projects[0] : undefined;
  }
}
