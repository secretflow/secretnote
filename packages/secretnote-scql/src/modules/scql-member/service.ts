// Service about project members management.

import { inject, prop, singleton } from '@difizen/mana-app';

import { type _Member, BrokerService } from '@/modules/scql-broker';
import { getProjectId } from '@/utils/scql';

@singleton()
export class MemberService {
  protected readonly service: BrokerService;
  @prop() members: _Member[] = [];

  constructor(@inject(BrokerService) service: BrokerService) {
    this.service = service;

    this.getProjectMembers(getProjectId());
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
