import './index.less';

interface IProps {
  code: string[];
  className?: string;
  style?: React.CSSProperties;
}

const ShViewer = (props: IProps) => {
  const { code, className, style } = props;

  return (
    <div className={`${className || ''} language-sh`} style={style}>
      <pre>
        <code>
          {code.map((line, index) => (
            <span className="line" key={index}>
              <span className="caret">&gt;</span> <span className="code">{line}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};

export { ShViewer };
