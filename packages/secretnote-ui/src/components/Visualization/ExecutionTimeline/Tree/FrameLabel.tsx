import type { Frame } from '@/.openapi-stubs';

import { useVisualizationData } from '../../VisualizationContext/utils';

export function FrameLabel({ frame }: { frame: Frame }) {
  const { reify } = useVisualizationData();
  return <span>{reify('function', frame.function)?.name}</span>;
}
