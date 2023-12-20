import type { JSONSchema } from '@apidevtools/json-schema-ref-parser/dist/lib/types';
import { Editor } from '@monaco-editor/react';

function get<T>($ref: string, schema: JSONSchema | undefined): T | undefined {
  let result = schema;
  const parts = $ref.slice(1).split('/');
  parts.shift();
  while (parts.length) {
    const part = parts.shift();
    if (!part) {
      break;
    }
    // @ts-expect-error untyped access
    const next = (result || {})[part];
    if (!next) {
      return undefined;
    }
    result = next;
  }
  return result as T;
}

export function API({ name, info }: { name: string; info: JSONSchema | undefined }) {
  return (
    <div>
      <h1>{get(`#/definitions/${name}/title`, info)}</h1>
      <Editor height="600px" language="json" value={JSON.stringify(info, null, 2)} />
    </div>
  );
}
