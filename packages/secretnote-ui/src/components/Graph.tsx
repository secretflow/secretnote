import { Graph as GraphProps } from '../.openapi-stubs';
import { useEffect, useRef } from 'react';
import G6 from '@antv/g6';
import { GraphData } from '@antv/g6';
import { useGetters } from '../utils';

export function Graph({ nodes, edges }: GraphProps) {
  const container = useRef<HTMLDivElement>(null);
  const { deref, numbering } = useGetters();
  useEffect(() => {
    if (!container.current) {
      return;
    }
    const graph = new G6.Graph({
      container: container.current,
      width: container.current.clientWidth,
      height: container.current.clientHeight,
      layout: {
        type: 'dagre',
        ranksep: 20,
        nodesep: 10,
        controlPoints: true,
      },
      defaultEdge: {
        type: 'polyline',
        style: {
          radius: 20,
          offset: 45,
          endArrow: true,
          lineWidth: 1,
          stroke: '#C2C8D5',
        },
      },
      modes: {
        default: [
          'drag-canvas',
          { type: 'zoom-canvas', sensitivity: 2, minZoom: 0.5, maxZoom: 1.2 },
        ],
      },
      fitView: true,
      fitViewPadding: 10,
    });
    const getLabel = (ref: string) => {
      const value = deref({ id: ref });
      if (!value) {
        return ref;
      }
      switch (value.kind) {
        case 'device':
          return `${value.location.kind}(${value.location.parties.join(', ')})`;
        case 'remote_object':
          return `${value.location.kind[0]}(${numbering({ id: value.id })})`;
        case 'function':
          return value.name;
        default:
          return 'IO';
      }
    };
    const v =
      nodes?.map((node) => {
        switch (node.kind) {
          case 'value':
            return {
              ...node,
              anchorPoints: [
                [0.5, 0],
                [0.5, 1],
              ],
              type: 'circle',
              size: 40,
              label: getLabel(node.ref),
            };
          case 'location':
            return {
              ...node,
              anchorPoints: [
                [0.5, 0],
                [0.5, 1],
              ],
              type: 'rect',
              size: [120, 40],
              label: getLabel(node.ref),
            };
        }
      }) ?? [];
    const e = edges?.map((edge) => edge) ?? [];
    const data: GraphData = { nodes: v, edges: e };
    graph.data(data);
    graph.render();
    const resizeObserver = new ResizeObserver(() => {
      if (!container.current) {
        return;
      }
      graph.changeSize(container.current.clientWidth, container.current.clientHeight);
    });
    resizeObserver.observe(container.current);
    return () => {
      graph.destroy();
      resizeObserver.disconnect();
    };
  }, [nodes, edges, deref, numbering]);
  return <div style={{ width: '100%', height: '600px' }} ref={container} />;
}
