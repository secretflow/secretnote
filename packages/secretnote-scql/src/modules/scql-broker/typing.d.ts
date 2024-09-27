namespace SCQL {
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

  export type _ProjectInvitationStatus = 'UNDECIDED' | 'ACCEPTED' | 'REJECTED';
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
}
