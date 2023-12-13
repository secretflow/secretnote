import type { Frame } from '../.openapi-stubs';

export function* flattenedTraces(traces: Frame[]): Generator<Frame, void, void> {
  for (const trace of traces) {
    yield trace;
    if (trace.inner_frames) {
      yield* flattenedTraces(trace.inner_frames);
    }
  }
}
