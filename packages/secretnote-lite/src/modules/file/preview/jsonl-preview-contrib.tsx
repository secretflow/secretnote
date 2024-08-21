import { singleton } from '@difizen/mana-app';
import hljs from 'highlight.js';
import { useEffect } from 'react';
import styled from 'styled-components';

import 'highlight.js/styles/xcode.css'; // 选择主题 https://highlightjs.org/demo
import { FilePreviewContribution } from '../protocol';

const CodeWrapper = styled.pre`
  width: 100%;
  height: 100%;
  overflow: scroll;
  margin: 0;

  .line-number {
    float: left;
    text-align: right;
    margin-right: 12px;
    color: #bfbfbf;
    user-select: none;
  }

  code {
    padding: 0 1em !important;
  }
`;

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
    <CodeWrapper>
      <span className="line-number">{lineNumber}</span>
      <code className="language-json">{props.data}</code>
    </CodeWrapper>
  );
};

@singleton({ contrib: [FilePreviewContribution] })
export class JsonlPreview implements FilePreviewContribution {
  type = 'jsonl';
  render = (data: string) => {
    return <JsonlView data={data} />;
  };
}
