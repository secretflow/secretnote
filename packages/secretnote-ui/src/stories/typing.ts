export type SnapshotRef = {
  kind: 'ref';
  id: string;
};

export type ObjectSnapshot = {
  kind: 'object';
  type: string;
  id: string;
  hash?: string | null;
  snapshot: string;
};

export type ObjectLocation = string[];
export type Path = string[];

export type LocationSnapshot = {
  kind: 'remote_location';
  type: string;
  id: string;
  location: ObjectLocation;
};

export type RemoteObjectSnapshot = {
  kind: 'remote_object';
  type: string;
  id: string;
  location: ObjectLocation;
};

export type SequenceSnapshot = {
  kind: 'sequence';
  type: string;
  id: string;
  hash?: string | null;
  snapshot: string;
  values: SnapshotType[];
};

export type MappingSnapshot = {
  kind: 'mapping';
  type: string;
  id: string;
  hash?: string | null;
  snapshot: string;
  values: Record<string, SnapshotType>;
};

export type UnboundSnapshot = {
  kind: 'unbound';
  annotation: string;
};

export type FunctionSnapshot = {
  kind: 'function';
  type: string;

  id: string;
  hash: string;
  module?: string | null;
  name: string;

  boundvars: Record<string, SnapshotType>;
  freevars: Record<string, SnapshotType>;
  retval: SnapshotType;

  filename?: string | null;
  firstlineno?: number;
  source?: string | null;
  docstring?: string | null;
};

export type SnapshotType =
  | SnapshotRef
  | ObjectSnapshot
  | LocationSnapshot
  | RemoteObjectSnapshot
  | SequenceSnapshot
  | MappingSnapshot
  | UnboundSnapshot
  | FunctionSnapshot;

export type SourceLocation = {
  filename: string;
  lineno: number;
  func: string;
  code?: string | null;
};

export type CheckpointInfo = {
  api_level?: number;
  description?: number;
};

export type Invocation = {
  checkpoint: CheckpointInfo;
  snapshot: FunctionSnapshot;
  stackframes: SourceLocation[];
};

export type DriverValue = {
  kind: 'driver';
  path: Path;
  snapshot: SnapshotType;
};

export type RemoteValue = {
  kind: 'remote';
  path: Path;
  index: number;
  snapshot: RemoteObjectSnapshot;
};

export type SemanticValue = DriverValue | RemoteValue;

export type InvariantExpression = {
  expr: 'invariant';
  semantic: string;
  inputs: SemanticValue[];
  destination: ObjectLocation;
  outputs: SemanticValue[];
};

export type InterpretedCall = {
  expression?: InvariantExpression;
  span_id: string;
  start_time: string;
  end_time: string;
  call: Invocation;
  inner_calls: InterpretedCall[];
};
