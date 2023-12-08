import { inject, singleton, prop } from '@difizen/mana-app';
import { history } from 'umi';

import { RequestService } from '@/modules/request';
import { randomHex } from '@/utils';

export interface Member {
  name: string;
  creator: boolean;
  color: string;
}

@singleton()
export class MemberService {
  protected readonly requestService: RequestService;

  @prop()
  members: Member[] = [];

  constructor(@inject(RequestService) requestService: RequestService) {
    this.requestService = requestService;
  }

  async getMemberList() {
    const project = await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getProjectInfo',
        project_id: this.getProjectId(),
      }),
    });
    if (project) {
      this.members = project.members.map((item: string) => ({
        name: item,
        creator: item === project.creator,
        color: randomHex(),
      }));
    }
    return this.members;
  }

  async inviteMember(name: string) {
    await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'inviteMember',
        project_id: this.getProjectId(),
        invitee: name,
      }),
    });
  }

  getProjectId() {
    const list = history.location.pathname.split('/');
    return list[list.length - 1];
  }
}
