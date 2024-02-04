import hljs from 'highlight.js';
import { useEffect } from 'react';

import 'highlight.js/styles/a11y-dark.css';

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
    <pre style={{ background: '#2b2b2b', padding: '12px 0', borderRadius: 8 }}>
      <code className="language-bash" style={{ padding: '0 1em' }}>
        {code}
      </code>
    </pre>
  );
};

export { ShViewer };
