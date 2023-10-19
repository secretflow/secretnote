import { downloadFileByBlob } from '@/utils';

interface IProps {
  url: string;
  fileName: string;
  children: React.ReactNode;
  className?: string;
}

const DownloadLink = (props: IProps) => {
  const { url, fileName, children, className } = props;

  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    downloadFileByBlob(url, fileName);
  };

  return (
    <a className={className} onClick={(e) => onClick(e)}>
      {children}
    </a>
  );
};

export { DownloadLink };
