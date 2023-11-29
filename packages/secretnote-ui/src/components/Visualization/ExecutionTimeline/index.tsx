import type { Frame } from '@/.openapi-stubs';

import { useVisualizationData } from '../VisualizationContext/utils';

function flattened(data: Frame[]): Frame[] {
  return data.reduce<Frame[]>((acc, f) => {
    acc.push(f);
    if (f.inner_frames) {
      acc.push(...flattened(f.inner_frames));
    }
    return acc;
  }, []);
}

export function ExecutionTimeline() {
  const {
    props: { frames },
  } = useVisualizationData();
  return (
    <div>
      {flattened(frames).map((f) => (
        <p key={f.span_id}></p>
      ))}
    </div>
  );
}
