// Service about project members management.

import { singleton, prop, inject } from '@difizen/mana-app';

import { _ProjectMember, BrokerService } from '@/modules/scql-broker';

@singleton()
export class ProjectMemberService {
  protected readonly service: BrokerService;
  @prop() members: _ProjectMember[] = [];

  constructor(@inject(BrokerService) service: BrokerService) {
    this.service = service;
  }

  /**
   * Get members of project. Update `members` in place and return it.
   */
  async getProjectMembers(projectId: string) {
    const project = (await this.service.listProjects(projectId))[0];

    if (project) {
      this.members = project.members.map((v) => ({
        party: v,
        isCreator: v === project.creator,
      }));
    } else {
      this.members = [];
    }

    return this.members;
  }
}
