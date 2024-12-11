import { useInject } from '@difizen/mana-app';
import { FilePreviewService } from './service';
import { Divider, Drawer } from 'antd';
import { l10n } from '@difizen/mana-l10n';
import CSVPreviewer from './previewer-csv';

export const FilePreviewComponent = () => {
  const { previewOpen, close, file } = useInject(FilePreviewService);

  return (
    <Drawer
      open={previewOpen}
      onClose={() => close()}
      title={l10n.t('文件预览')}
      width={800}
      forceRender
    >
      {file.ext}
      <Divider />
      <CSVPreviewer data={file.content} />
    </Drawer>
  );
};
