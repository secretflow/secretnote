import { python } from '@codemirror/lang-python';
import { githubLight } from '@uiw/codemirror-theme-github';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { useRef } from 'react';

interface IProps {
  code: string;
  style?: Record<string, React.CSSProperties>;
}

const CodeBlock = (props: IProps) => {
  const ref = useRef<ReactCodeMirrorRef>(null);
  const { code, style } = props;

  return (
    <CodeMirror
      ref={ref}
      style={{ ...style }}
      value={code}
      theme={githubLight}
      extensions={[python()]}
    />
  );
};

export { CodeBlock };
