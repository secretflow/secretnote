import { type LibroView, NotebookCommands } from '@difizen/libro-jupyter';
import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Modal } from 'antd';
import { useCallback } from 'react';

export function RestartClearOutputModalComponent({
  visible,
  close,
  data,
}: ModalItemProps<LibroView>) {
  const handleRestart = useCallback(() => {
    data?.restartClearOutput();
    close();
  }, [data, close]);

  return (
    <Modal
      title={l10n.t('清空输出并重启所有 Kernel？')}
      open={visible}
      onOk={handleRestart}
      onCancel={() => close()}
      width={'420px'}
      centered={true}
      okText={l10n.t('确认')}
      cancelText={l10n.t('取消')}
    >
      {l10n.t('确认清空输出并重启所有节点的 Kernel？将丢失全部变量。')}
    </Modal>
  );
}

export const RestartClearOutputModal: ModalItem<LibroView> = {
  id: NotebookCommands.RestartClearOutput.id,
  component: RestartClearOutputModalComponent,
};
