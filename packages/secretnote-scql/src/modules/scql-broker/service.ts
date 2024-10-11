// Service for interacting with backend's broker APIs only without states.
// @see https://www.secretflow.org.cn/zh-CN/docs/scql/0.9.0b1/reference/broker-api
// @see pyprojects/secretnote/secretnote/scql/server/services/broker_manager.py
// The schema follows the document, best effort.

import { prop, singleton } from '@difizen/mana-app';
import { pick } from 'lodash-es';

import { genericErrorHandler, request } from '@/utils';
import {
  toSnakeCaseObject as snake,
  toCamelCaseObject as camel,
  ToSnakeCaseObject,
} from '@/utils/object';

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

// scql.pb.SQLWarning
export type SQLWarning = {
  reason: string;
};

// scql.pb.TensorShape
export type TensorShape = {
  dim: {
    dim_value?: number;
    dim_param?: string;
  }[];
};

// scql.pb.Tensor
export type Tensor = {
  name: string;
  shape: TensorShape;
  elem_type: 'PrimitiveDataType_UNDEFINED' | TableColumnDesc['dtype'];
  option: 'VALUE' | 'REFERENCE' | 'VARIABLE';
  status:
    | 'TENSORSTATUS_UNKNOWN'
    | 'TENSORSTATUS_PRIVATE'
    | 'TENSORSTATUS_SECRET'
    | 'TENSORSTATUS_CIPHER'
    | 'TENSORSTATUS_PUBLIC';
  int32_data?: number[];
  int64_data?: number[];
  float_data?: number[];
  double_data?: number[];
  string_data?: string[];
  bool_data?: boolean[];
};

// scql.pb.QueryResult
export type QueryResult = {
  affected_rows?: number;
  warnings?: SQLWarning[];
  cost_time_s: number;
  out_columns?: Tensor[];
};

// the following types are defined by ourself without corresponding protobuf
export type _PlatformInfo = {
  party: string; // self party
  broker: string; // address of broker API
};

// member of a project
export type _Member = {
  party: string; // name of the party
  isCreator: boolean;
};

// table inside a project
export type _Table = {
  tableName: string;
  tableOwner: string;
  refTable: string; // The refered physical table, e.g. `db.table`
  dbType: 'MySQL' | 'Postgres' | 'csvdb';
  columns: TableColumnDesc[];
};

type ErrorHandlerOptions = Parameters<typeof genericErrorHandler>['1'];

/**
 * Reqeust the broker with the given action and body.
 * CamelCase body keys will be transformed into snake-case automatically.
 */
async function requestBroker<T>(
  action: BrokerActions,
  body?: Record<string, any>,
  errorHandlerOptions?: ErrorHandlerOptions,
) {
  return request<T>('api/broker', {
    method: 'POST',
    body: JSON.stringify({
      action,
      ...snake(body ?? {}),
    }),
  }).catch((e) => genericErrorHandler(e, errorHandlerOptions)) as T;
}

@singleton()
export class BrokerService {
  @prop() platformInfo: _PlatformInfo = { party: '', broker: '' };

  constructor() {
    this.refreshPlatformInfo();
  }

  /**
   * Get the platform info.
   * Update in place and return.
   */
  async refreshPlatformInfo() {
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
  async processInvitation(
    invitationId: string,
    respond: _ProjectInvitationRespond,
    _options?: ErrorHandlerOptions,
  ) {
    return await requestBroker<{}>(
      BrokerActions.processInvitation,
      snake({
        invitationId,
        respond,
      }),
      _options,
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
  async createTable(projectId: string, table: _Table, _options?: ErrorHandlerOptions) {
    return await requestBroker<{}>(
      BrokerActions.createTable,
      {
        projectId,
        ...pick(table, ['tableName', 'refTable', 'dbType', 'columns']),
      },
      _options,
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
    return BrokerService.ShowCCL(projectId, tables, destParties);
  }

  /**
   * [static] (For SQL auto-complete) Show CCLs in specified Project,
   * supports specifying Tables, members.
   */
  static async ShowCCL(
    projectId: string,
    tables?: string[],
    destParties?: 'self' | 'others' | string,
    _options?: ErrorHandlerOptions,
  ) {
    return await requestBroker<ColumnControl[]>(
      BrokerActions.showCCL,
      {
        projectId,
        tables,
        destParties,
      },
      _options,
    );
  }

  /**
   * List all Tables in specified Project.
   */
  async listTables(projectId: string, names?: string[]) {
    return BrokerService.ListTables(projectId, names);
  }

  /**
   * [static] (For SQL auto-complete) List all Tables in specified Project.
   */
  static async ListTables(
    projectId: string,
    names?: string[],
    _options?: ErrorHandlerOptions,
  ) {
    return (
      await requestBroker<ToSnakeCaseObject<_Table>[]>(
        BrokerActions.listTables,
        {
          projectId,
          names,
        },
        _options,
      )
    ).map(camel);
  }

  /**
   * Grant CCLs of your Table to a specific member.
   */
  async grantCCL(
    projectId: string,
    columnControlList: ColumnControl[],
    _options?: ErrorHandlerOptions,
  ) {
    return await requestBroker<{}>(
      BrokerActions.grantCCL,
      {
        projectId,
        columnControlList,
      },
      _options,
    );
  }

  /**
   * Run Query synchronously and return query result if the query completes within a specified timeout.
   */
  async doQuery(projectId: string, query: string, _options?: ErrorHandlerOptions) {
    return await requestBroker<QueryResult>(
      BrokerActions.doQuery,
      {
        projectId,
        query,
      },
      _options,
    );
  }
}
