import { singleton, prop } from '@difizen/mana-app';
import { history } from 'umi';

import { randomHex, request } from '@/utils';

export interface Member {
  name: string;
  creator: boolean;
  color: string;
}

@singleton()
export class MemberService {
  @prop()
  members: Member[] = [];

  async getMemberList() {
    const { party } = await this.getPlatformInfo();
    const project = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getProjectInfo',
        project_id: this.getProjectId(),
      }),
    });
    if (project) {
      this.members = project.members.map((item: string) => ({
        name: item === party ? `${item} (you)` : item,
        creator: item === project.creator,
        color: randomHex(),
      }));
    }
    return this.members;
  }

  async inviteMember(name: string) {
    await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'inviteMember',
        project_id: this.getProjectId(),
        invitee: name,
      }),
    });
  }

  async getPlatformInfo() {
    const platformInfo = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getPlatformInfo',
      }),
    });
    return platformInfo;
  }

  getProjectId() {
    const list = history.location.pathname.split('/');
    return list[list.length - 1];
  }
}
