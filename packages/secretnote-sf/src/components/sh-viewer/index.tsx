import hljs from 'highlight.js';
import { useEffect } from 'react';
import styled from 'styled-components';
import 'highlight.js/styles/a11y-dark.css';

const CodeWrapper = styled.pre`
  background: #2b2b2b;
  padding: 12px 0;
  border-radius: 8px;

  code {
    padding: 0 1em !important;
  }
`;

interface IProps {
  code: string;
  className?: string;
  style?: React.CSSProperties;
}

const ShViewer = ({ code }: IProps) => {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  return (
    <CodeWrapper>
      <code className="language-bash">{code}</code>
    </CodeWrapper>
  );
};

export { ShViewer };
