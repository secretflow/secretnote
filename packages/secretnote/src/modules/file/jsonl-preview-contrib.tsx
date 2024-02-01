import { singleton } from '@difizen/mana-app';
import hljs from 'highlight.js';
import { useEffect } from 'react';

import { FilePreviewContribution } from './protocol';
import 'highlight.js/styles/xcode.css'; // 选择主题 https://highlightjs.org/demo

const JsonlView = (props: { data: string }) => {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  // 创建行号
  const lineNumber = props.data
    .trim()
    .split('\n')
    .map((_, index) => `${index + 1}\n`)
    .join('');

  return (
    <pre style={{ width: '100%', height: '100%', overflow: 'scroll', margin: 0 }}>
      <span
        style={{
          float: 'left',
          textAlign: 'right',
          marginRight: 12,
          color: '#bfbfbf',
          userSelect: 'none',
        }}
      >
        {lineNumber}
      </span>
      <code className="language-json" style={{ padding: '0 1em' }}>
        {props.data}
      </code>
    </pre>
  );
};

@singleton({ contrib: [FilePreviewContribution] })
export class JsonlPreview implements FilePreviewContribution {
  type = 'jsonl';
  render = (data: string) => {
    return <JsonlView data={data} />;
  };
}
