import { useMemo } from 'react';

import type { Frame } from '@/.openapi-stubs';
import { flattenedTraces } from '@/utils/iterators';

import { useVisualizationData } from '../VisualizationContext/utils';

function isTransactionFrame(frame: Frame): boolean {
  const ckpt = frame.checkpoints?.slice(-1)?.pop();
  return (
    (ckpt &&
      ckpt.function.module === 'fed.proxy.barriers' &&
      ['send', 'recv'].includes(ckpt.function.name)) ||
    false
  );
}

export function RayFedTransactions() {
  const {
    props: { frames },
    reify,
  } = useVisualizationData();
  const transactions = useMemo(() => {
    const traces: Frame[] = [];
    for (const trace of flattenedTraces(frames)) {
      // if (isTransactionFrame(trace)) {
      traces.push(trace);
      // }
    }
    return traces;
  }, [frames]);
  return (
    <>
      {transactions.map((t) => {
        return <pre key={t.span_id}>{t.span_id}</pre>;
        const func = reify('function', t.function);
        const frame = reify('frame', t.frame);
        if (func?.name === 'send') {
          const recipient = frame?.local_vars?.ofKind('object', 'dest_party')?.snapshot;
          const id2 = frame?.local_vars?.ofKind('object', 'downstream_seq_id')
            ?.snapshot;
          return (
            <pre key={t.frame?.ref}>
              {frame?.ref} send {id2} {recipient}
            </pre>
          );
        } else {
          const sender = frame?.local_vars?.ofKind('object', 'src_party')?.snapshot;
          const recipient = frame?.local_vars?.ofKind('object', 'party')?.snapshot;
          const id2 = frame?.local_vars?.ofKind('object', 'curr_seq_id')?.snapshot;
          return (
            <pre key={t.frame?.ref}>
              {frame?.ref} {recipient} recv {id2} {sender}
            </pre>
          );
        }
      })}
    </>
  );
}
