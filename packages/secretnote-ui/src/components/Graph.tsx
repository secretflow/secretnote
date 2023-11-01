import { Graph as GraphProps } from '../.openapi-stubs';
import { useEffect, useRef } from 'react';
import G6 from '@antv/g6';
import { GraphData } from '@antv/g6';

export function Graph({ nodes, edges }: GraphProps) {
  const container = useRef<HTMLDivElement>(null);

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
        default: [{ type: 'scroll-canvas' }],
      },
      minZoom: 0.8,
      maxZoom: 2,
    });

    const v =
      nodes?.map((node) => {
        switch (node.kind) {
          case 'local':
            return {
              ...node,
              anchorPoints: [
                [0.5, 0],
                [0.5, 1],
              ],
              type: 'circle',
              size: 40,
              label: `${node.data.name}`,
            };
          case 'remote':
            return {
              ...node,
              anchorPoints: [
                [0.5, 0],
                [0.5, 1],
              ],
              type: 'circle',
              size: 40,
              label: `${node.data.location.type[0]}${node.data.numbering}`,
            };
          case 'function':
            return {
              ...node,
              anchorPoints: [
                [0, 0.5],
                [0.5, 0],
                [0.5, 1],
                [1, 0.5],
              ],
              type: 'rect',
              size: [200, 40],
              label: node.data?.name || node.location.type,
            };
          default:
            throw new Error(`Unknown node kind: ${node.kind}`);
        }
      }) ?? [];

    const e =
      edges?.map((edge) => {
        switch (edge.kind) {
          case 'argument':
            return {
              ...edge,
              label: edge.name || '',
            };
          default:
            return edge;
        }
      }) ?? [];

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
  }, [nodes, edges]);

  return <div style={{ width: '100%', height: '600px' }} ref={container} />;
}
