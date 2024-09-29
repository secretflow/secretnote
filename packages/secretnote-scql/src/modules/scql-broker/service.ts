// Service for interacting with backend's broker APIs only without states.
// @see https://www.secretflow.org.cn/zh-CN/docs/scql/0.9.0b1/reference/broker-api
// @see pyprojects/secretnote/secretnote/scql/server/services/broker_manager.py
// The schema follows the document, best effort.

import { request } from '@/utils';
import { toSnakeCaseObject as snake } from '@/utils/object';
import { prop, singleton } from '@difizen/mana-app';
import { pick } from 'lodash-es';

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

// scql.pb.CreateTableRequest.ColumnDesc
export type TableColumnDesc = {
  name: string;
  // github.com/secretflow/scql/blob/main/proto-gen/api/v1/column.pb.go
  dtype:
    | 'INT'
    | 'INTEGER'
    | 'INT32'
    | 'INT64'
    | 'FLOAT32'
    | 'FLOAT64'
    | 'FLOAT'
    | 'DOUBLE'
    | 'STRING'
    | 'STR'
    | 'DATETIME'
    | 'TIMESTAMP';
};

// scql.pb.ColumnDef
export type ColumnDef = {
  column_name: string;
  table_name: string;
};

export enum _ColumnControlConstraint {
  UNKNOWN = 'UNKNOWN',
  PLAINTEXT = 'PLAINTEXT',
  ENCRYPTED_ONLY = 'ENCRYPTED_ONLY',
  PLAINTEXT_AFTER_JOIN = 'PLAINTEXT_AFTER_JOIN',
  PLAINTEXT_AFTER_GROUP_BY = 'PLAINTEXT_AFTER_GROUP_BY',
  PLAINTEXT_AFTER_COMPARE = 'PLAINTEXT_AFTER_COMPARE',
  PLAINTEXT_AFTER_AGGREGATE = 'PLAINTEXT_AFTER_AGGREGATE',
}

// scql.pb.ColumnControl
export type ColumnControl = {
  col: ColumnDef;
  party_code: string; // the code of party that the constraint applies to.
  constraint: _ColumnControlConstraint;
};

export interface TableCCL {
  column: string;
  [party: string]: string;
}

// the following types are defined by ourself without corresponding protobuf
export type _PlatformInfo = {
  party: string; // self party
  broker: string; // address of broker API
};

export type _ProjectMember = {
  party: string; // name of the party
  isCreator: boolean;
};

export type _Table = {
  projectId: string;
  tableName: string;
  tableOwner: string;
  refTable: string; // The refered physical table, e.g. `db.table`
  dbType: 'MySQL' | 'Postgres' | 'csvdb';
  columns: TableColumnDesc[];
};

async function requestBroker<T>(action: BrokerActions, body?: Record<string, any>) {
  return request<T>('api/broker', {
    method: 'POST',
    body: JSON.stringify({
      action,
      ...snake(body ?? {}),
    }),
  });
}

@singleton()
export class BrokerService {
  @prop() platformInfo: _PlatformInfo = { party: '', broker: '' };

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
    return (this.platformInfo = await requestBroker<_PlatformInfo>(
      BrokerActions.getPlatformInfo,
    ));
  }

  /**
   * List All Projects that have created and joined.
   */
  async listProjects(projectId?: string) {
    return await requestBroker<ProjectDesc[]>(BrokerActions.listProjects, {
      ids: projectId ? [projectId] : [],
    });
  }

  /**
   * Create a new Project and automatically become the Project member and creator.
   */
  async createProject(
    project: Pick<ProjectDesc, 'project_id' | 'name' | 'description' | 'conf'>,
  ) {
    return await requestBroker<{}>(BrokerActions.createProject, project);
  }

  /**
   * List all invitations sent and received.
   */
  async listInvitations(status?: _ProjectInvitationStatus, inviter?: string) {
    return await requestBroker<ProjectInvitation[]>(BrokerActions.listInvitations, {
      status,
      inviter,
    });
  }

  /**
   * Process the received invitation, specify it by invitation_id, choose to join the corresponding project or reject it
   */
  async processInvitation(invitationId: string, respond: _ProjectInvitationRespond) {
    return await requestBroker<{}>(
      BrokerActions.processInvitation,
      snake({
        invitationId,
        respond,
      }),
    );
  }

  /**
   * Invite another member to join the Project you created.
   */
  async inviteMember(invitee: string, projectId: string) {
    return await requestBroker<{}>(
      BrokerActions.inviteMember,
      snake({
        invitee,
        projectId,
        method: 'PUSH',
      }),
    );
  }

  /**
   * Create a Table you owned in specified Project.
   */
  async createTable(table: _Table) {
    return await requestBroker<{}>(
      BrokerActions.createTable,
      pick(table, ['projectId', 'tableName', 'refTable', 'dbType', 'columns']),
    );
  }

  /**
   * Drop a Table you owned in specified Project, the relevant CCLs will be automatically cleared.
   */
  async dropTable(projectId: string, tableName: string) {
    return await requestBroker<{}>(BrokerActions.dropTable, {
      projectId,
      tableName,
    });
  }

  /**
   * Show CCLs in specified Project, supports specifying Tables, members.
   */
  async showCCL(
    projectId: string,
    tables?: string[],
    destParties?: 'self' | 'others' | string,
  ) {
    return await requestBroker<TableCCL[]>(BrokerActions.showCCL, {
      projectId,
      tables,
      destParties,
    });
  }

  /**
   * List all Tables in specified Project.
   */
  async listTables(projectId: string, names?: string[]) {
    return await requestBroker<_Table[]>(BrokerActions.listTables, {
      projectId,
      names,
    });
  }

  /**
   * Grant CCLs of your Table to a specific member.
   */
  async grantCCL(projectId: string, columnControlList: ColumnControl[]) {
    return await requestBroker<{}>(BrokerActions.grantCCL, {
      projectId,
      columnControlList,
    });
  }
}
