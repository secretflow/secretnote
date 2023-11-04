import * as G6 from '@antv/g6';
import { Card, ConfigProvider, Divider, Form, Switch } from 'antd';
import type { MouseEventHandler, MutableRefObject } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Graph as GraphProps, LogicalLocation } from '../../.openapi-stubs';
import { useDataProvider } from '../DataProvider/utils';

import type { Colorizer } from './colorization';
import { colorizeByLocation, recolorOnHover, useColorizer } from './colorization';
import { LocationColorizer } from './colorization';
import { setupG6 } from './shapes';
import { tooltip } from './tooltip';
import { isTrusted, type GraphNodeType } from './types';
import { partitionByEntityType, partitionByLocation } from './utils';

type GraphRef = MutableRefObject<G6.Graph | undefined>;

const { fromGraph } = setupG6();

const defaultColorizer = () =>
  new LocationColorizer([
    '#79a25c',
    '#de4c8b',
    '#8271df',
    '#3398a6',
    '#c47d3a',
    '#b45dcb',
    '#4c99d8',
    '#df6a72',
  ]);

function Legend({
  graph,
  colorizer,
}: {
  graph: GraphRef;
  colorizer: Colorizer<LogicalLocation>;
}) {
  const locationColorizer = useMemo(
    () =>
      recolorOnHover({
        partition: partitionByLocation,
        colorize: colorizeByLocation(colorizer.colorize),
      }),
    [colorizer.colorize],
  );

  const resetColors = useCallback<MouseEventHandler>(() => {
    if (!graph.current) {
      return;
    }
    locationColorizer(graph.current).highlight(null);
  }, [graph, locationColorizer]);

  const highlight = useCallback(
    (locationKey: string): MouseEventHandler =>
      () => {
        if (!graph.current) {
          return;
        }
        const target = graph.current.getNodes().find((v) => {
          const model = v.getModel();
          if (!isTrusted<GraphNodeType>(model)) {
            return false;
          }
          switch (model.data.kind) {
            case 'function':
              return LocationColorizer.locationKey(model.data.location) === locationKey;
            case 'remote':
              return (
                LocationColorizer.locationKey(model.data.data.location) === locationKey
              );
            default:
              return false;
          }
        });
        if (target) {
          locationColorizer(graph.current).highlight(target.getID());
        }
      },
    [graph, locationColorizer],
  );

  const [hovered, setHovered] = useState<string>();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '20px 1fr',
        gridAutoRows: '20px',
        alignItems: 'center',
        gap: '0.3rem',
      }}
      onMouseLeave={(e) => {
        setHovered(undefined);
        resetColors(e);
      }}
    >
      {[...colorizer.colors()].map(([key, { name, color }]) => (
        <Fragment key={key}>
          <div
            style={{ width: 16, height: 16, margin: 2, backgroundColor: color }}
            onMouseEnter={(e) => {
              highlight(key)(e);
              setHovered(key);
            }}
          />
          <div
            onMouseEnter={(e) => {
              highlight(key)(e);
              setHovered(key);
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: hovered === key ? 700 : 400,
                pointerEvents: 'none',
              }}
            >
              {name}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function useExecutionGraph() {
  const { reify } = useDataProvider();

  const colorizer = useColorizer(defaultColorizer);

  const entityColorizer = useMemo(
    () =>
      recolorOnHover({
        partition: partitionByEntityType,
        colorize: colorizeByLocation(colorizer.colorize),
      }),
    [colorizer.colorize],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<G6.Graph>();
  const tooltipEnabledRef = useRef(true);

  useEffect(() => {
    if (!containerRef.current) {
      graphRef.current = undefined;
      return;
    }

    const graph = new G6.Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        type: 'dagre',
        ranksepFunc: (node: { data: GraphNodeType }) => {
          if (node.data?.kind === 'reveal' || node.data?.kind === 'remote') {
            return 2.5;
          }
          if (node.data?.kind === 'local') {
            return 5;
          }
          return 10;
        },
        nodesep: 10,
      },
      modes: {
        default: [
          { type: 'scroll-canvas' },
          { type: 'drag-canvas' },
          {
            type: 'tooltip',
            formatText: (model) => {
              if (!tooltipEnabledRef.current) {
                return '';
              }
              return tooltip(model, reify);
            },
            offset: 10,
          },
        ],
        highlighting: [],
      },
      minZoom: 0.2,
      maxZoom: 3,
    });

    graph.on('node:click', ({ item }) => {
      if (item) {
        graph.focusItem(item);
      }
    });

    entityColorizer(graph).enable();

    graphRef.current = graph;

    return () => {
      graph.destroy();
    };
  }, [entityColorizer, reify]);

  useEffect(() => {
    const outputView = containerRef.current?.closest('.jp-LinkedOutputView');
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) {
        return;
      }
      const [height, cssHeight] = (() => {
        if (outputView && outputView.clientHeight !== 0) {
          return [outputView.clientHeight, `${outputView.clientHeight}px`];
        }
        return [
          containerRef.current.clientHeight,
          `${containerRef.current.clientHeight}px`,
        ];
      })();
      containerRef.current.style.height = cssHeight;
      graphRef.current?.changeSize(containerRef.current.clientWidth, height);
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (outputView) {
      resizeObserver.observe(outputView);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return {
    container: containerRef,
    graph: graphRef,
    colorizer,
    tooltipEnabled: tooltipEnabledRef,
    load: (data: GraphProps) => {
      graphRef.current?.data(fromGraph(data, { reify, colorize: colorizer.colorize }));
      graphRef.current?.render();
    },
  };
}

export function ExecutionGraph(data: GraphProps) {
  const { container, load, graph, colorizer, tooltipEnabled } = useExecutionGraph();

  useEffect(() => {
    load(data);
  }, [data, load]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{ width: '100%', height: '80vh', minHeight: '600px' }}
        ref={container}
      />
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <Card size="small" style={{ fontSize: '.8rem' }}>
          <Legend graph={graph} colorizer={colorizer} />
          <ConfigProvider theme={{ token: { marginLG: 8 } }}>
            <Divider />
          </ConfigProvider>
          <Form.Item
            name="tooltipEnabled"
            label="Tooltip on hover"
            style={{
              margin: 0,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              fontSize: '.8rem',
            }}
            colon={false}
          >
            <Switch
              size="small"
              defaultChecked={tooltipEnabled.current}
              onChange={(checked) => {
                tooltipEnabled.current = checked;
              }}
            />
          </Form.Item>
        </Card>
      </div>
    </div>
  );
}
