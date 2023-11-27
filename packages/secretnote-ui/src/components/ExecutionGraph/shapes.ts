import type {
  ArgumentEdge,
  ReturnEdge,
  RevealEdge,
  TransformEdge,
} from '../../.openapi-stubs';
import { truncate, truncateLines, wrap } from '../../utils/string';

import { defineShape, registerShapes } from './utils';

declare module '@antv/g6' {
  interface IShape {
    getPoint(ratio: number): {
      x: number;
      y: number;
    };
  }
}

const LOCAL_DATA_NODE = defineShape({
  kind: 'local',
  render: ({
    item,
    renderer,
    config: {
      colors: { foreground, background } = {
        foreground: '#ffffff',
        background: '#1d1d1d',
      },
    },
    utils: { reify },
  }) => {
    const value = reify(undefined, item.data);

    let content: string = '';

    switch (value?.kind) {
      case 'dict':
      case 'list':
      case 'object':
        content = `${value.snapshot}`;
        break;
      case 'function':
        content = `${value.name}()`;
        break;
      default:
        break;
    }

    content = content.trim();

    let label: string;

    if (item.data.name && content) {
      label = `${item.data.name} = ${content}`;
      if (label.length > 12) {
        label = `${item.data.name}\n= ${content}`;
      }
    } else {
      label = content;
    }

    label = truncateLines(label, { maxLines: 3, maxWidth: 15 });

    const rect = renderer.addShape('rect', {
      name: 'background',
      attrs: {
        anchorPoints: [
          [0.5, 0],
          [0.5, 1],
        ],
        stroke: null,
        fill: background,
      },
    });

    const text = renderer.addShape('text', {
      name: 'label',
      attrs: {
        text: label,
        x: 0,
        y: 0,
        fontFamily: 'Roboto Mono, monospace',
        fontSize: 12,
        lineHeight: 16.8,
        textAlign: 'center',
        textBaseline: 'middle',
        fill: foreground,
      },
    });

    const { width, height, x, y } = text.getBBox();

    rect.attr('width', width + 10);
    rect.attr('height', height + 10);
    rect.attr('x', x - 5);
    rect.attr('y', y - 5);

    return rect;
  },
});

const REMOTE_DATA_NODE = defineShape({
  kind: 'remote',
  render: ({ item, renderer, config: { colors }, utils: { colorize } }) => {
    const { background, foreground } = colors || colorize(item.data.location);
    const label = `${item.data.location.type[0]}${item.data.numbering}`;

    const rect = renderer.addShape('circle', {
      name: 'background',
      attrs: {
        x: 0,
        y: 0,
        anchorPoints: [
          [0.5, 0],
          [0.5, 1],
        ],
        stroke: null,
        fill: background,
      },
    });

    renderer.addShape('text', {
      name: 'label',
      attrs: {
        text: label,
        x: 0,
        y: 0,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
        textBaseline: 'middle',
        fill: foreground,
      },
    });

    const diameter = 40 + Math.floor(Math.log10(item.data.numbering || 0) / 2) * 5;

    rect.attr('width', diameter);
    rect.attr('height', diameter);
    rect.attr('x', 0);
    rect.attr('y', 0);
    rect.attr('r', diameter / 2);

    return rect;
  },
});

const FUNCTION_NODE = defineShape({
  kind: 'function',
  render: ({ item, renderer, config: { colors }, utils: { reify, colorize } }) => {
    const { background, foreground } = colors || colorize(item.location);

    const label = (() => {
      const parties = item.location.parties.map((d) => d[0].toUpperCase()).join(',');
      if (item.function) {
        const value = reify('function', item.function);
        if (value) {
          return truncateLines(wrap(`let ${parties} in ${value.name}`, '.', 24), {
            maxWidth: 24,
            maxLines: 2,
          });
        }
      }
      return `let ${parties} in (anonymous)`;
    })();

    const rect = renderer.addShape('rect', {
      name: 'background',
      attrs: {
        radius: 8,
        anchorPoints: [
          [0.5, 0],
          [0.5, 1],
        ],
        stroke: null,
        fill: background,
        lineWidth: 2,
      },
    });

    const text = renderer.addShape('text', {
      name: 'label',
      attrs: {
        text: label,
        x: 0,
        y: 0,
        fontFamily: 'Roboto Mono, monospace',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 14.4,
        letterSpacing: 0.5,
        textAlign: 'center',
        textBaseline: 'middle',
        fill: foreground,
      },
    });

    const { width, height, x, y } = text.getBBox();

    rect.attr('width', width + 30);
    rect.attr('height', height + 15);
    rect.attr('x', x - 15);
    rect.attr('y', y - 7.5);

    return rect;
  },
});

const REVEAL_NODE = defineShape({
  kind: 'reveal',
  render: ({
    renderer,
    config: {
      colors: { background, foreground } = {
        background: '#f04654',
        foreground: '#ffffff',
      },
    },
  }) => {
    const rect = renderer.addShape('rect', {
      name: 'background',
      attrs: {
        anchorPoints: [
          [0.5, 0],
          [0.5, 1],
        ],
        stroke: null,
        fill: background,
      },
    });
    const text = renderer.addShape('text', {
      name: 'label',
      attrs: {
        text: 'reveal',
        x: 0,
        y: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 16.8,
        textAlign: 'center',
        textBaseline: 'middle',
        fill: foreground,
      },
    });

    const { width, height, x, y } = text.getBBox();

    rect.attr('width', width + 10);
    rect.attr('height', height + 10);
    rect.attr('x', x - 5);
    rect.attr('y', y - 5);

    return rect;
  },
});

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// https://www.desmos.com/calculator/fjaz7sv20l
// https://chat.openai.com/share/1f0e4621-9c46-491b-92c1-c62c798f46b8
function textRotation(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let theta = Math.atan2(dy, dx);
  if (dx < 0) {
    theta -= Math.PI;
  }
  if (theta > (70 / 180) * Math.PI) {
    return theta - (1 / 2) * Math.PI;
  }
  if (theta < (-70 / 180) * Math.PI) {
    return theta + (1 / 2) * Math.PI;
  }
  return theta;
}

const ARGUMENT_EDGE = defineShape<ArgumentEdge, 'argument'>({
  kind: 'argument',
  render: ({
    item,
    renderer,
    config: {
      startPoint = { x: 0, y: 0 },
      endPoint = { x: 0, y: 0 },
      colors: { background, foreground } = {
        background: '#a5aab5',
        foreground: '#ffffff',
      },
    },
  }) => {
    const shape = renderer.addShape('path', {
      name: 'line',
      attrs: {
        stroke: background,
        lineWidth: 1,
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x, endPoint.y],
        ],
        endArrow: {
          path: 'M 5 -5 L 0 0 L 5 5',
          lineWidth: 1,
        },
      },
    });
    if (item.name) {
      const label = truncate(item.name, 20);
      const midPoint = shape.getPoint(0.5);
      const rect = renderer.addShape('rect', {
        name: 'label-background',
        attrs: {
          radius: 0,
          anchorPoints: [
            [0.5, 0],
            [0.5, 1],
          ],
          stroke: null,
          fill: background,
        },
      });
      const text = renderer.addShape('text', {
        name: 'label',
        attrs: {
          text: label,
          x: midPoint.x,
          y: midPoint.y,
          fontFamily: 'Roboto Mono, monospace',
          fontStyle: 'italic',
          fontSize: 11,
          textAlign: 'center',
          textBaseline: 'middle',
          fill: foreground,
        },
      });
      const { width, height, x, y } = text.getBBox();
      rect.attr('width', width + 5);
      rect.attr('height', height + 5);
      const rotation = textRotation(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
      if (
        width > 30 &&
        width < distance(startPoint.x, startPoint.y, endPoint.x, endPoint.y) - 20
      ) {
        rect.rotateAtPoint(midPoint.x, midPoint.y, rotation);
        text.rotateAtPoint(midPoint.x, midPoint.y, rotation);
      }
      rect.attr('x', x - 2.5);
      rect.attr('y', y - 2.5);
    }
    return shape;
  },
});

const REVEAL_EDGE = defineShape<RevealEdge, 'reveal'>({
  kind: 'reveal',
  render: ({
    item,
    renderer,
    config: {
      startPoint = { x: 0, y: 0 },
      endPoint = { x: 0, y: 0 },
      colors: { background, foreground } = {
        background: '#f04654',
        foreground: '#ffffff',
      },
    },
  }) => {
    const shape = renderer.addShape('path', {
      name: 'line',
      attrs: {
        stroke: background,
        lineWidth: 1,
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x, endPoint.y],
        ],
        lineDash: [2],
      },
    });
    if (item.name) {
      const label = truncate(item.name, 20);
      const midPoint = shape.getPoint(0.5);
      const rect = renderer.addShape('rect', {
        name: 'label-background',
        attrs: {
          radius: 0,
          anchorPoints: [
            [0.5, 0],
            [0.5, 1],
          ],
          stroke: null,
          fill: background,
        },
      });
      const text = renderer.addShape('text', {
        name: 'label',
        attrs: {
          text: label,
          x: midPoint.x,
          y: midPoint.y,
          fontFamily: 'Roboto Mono, monospace',
          fontStyle: 'italic',
          fontSize: 11,
          textAlign: 'center',
          textBaseline: 'middle',
          fill: foreground,
        },
      });
      const { width, height, x, y } = text.getBBox();
      rect.attr('width', width + 5);
      rect.attr('height', height + 5);
      const rotation = textRotation(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
      if (
        width > 30 &&
        width < distance(startPoint.x, startPoint.y, endPoint.x, endPoint.y) - 20
      ) {
        rect.rotateAtPoint(midPoint.x, midPoint.y, rotation);
        text.rotateAtPoint(midPoint.x, midPoint.y, rotation);
      }
      rect.attr('x', x - 2.5);
      rect.attr('y', y - 2.5);
    }
    return shape;
  },
});

const RETURN_EDGE = defineShape<ReturnEdge, 'return'>({
  kind: 'return',
  render: ({
    item,
    renderer,
    config: {
      startPoint = { x: 0, y: 0 },
      endPoint = { x: 0, y: 0 },
      colors: { background, foreground } = {
        background: '#a5aab5',
        foreground: '#ffffff',
      },
    },
  }) => {
    const shape = renderer.addShape('path', {
      name: 'line',
      attrs: {
        stroke: background,
        lineWidth: 1,
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x, endPoint.y],
        ],
        endArrow: {
          path: 'M 5 -5 L 0 0 L 5 5',
          lineWidth: 1,
        },
      },
    });
    if (item.assignment) {
      const label = truncate(item.assignment, 20);
      const midPoint = shape.getPoint(0.5);
      const rect = renderer.addShape('rect', {
        name: 'label-background',
        attrs: {
          radius: 0,
          anchorPoints: [
            [0.5, 0],
            [0.5, 1],
          ],
          stroke: null,
          fill: background,
        },
      });
      const text = renderer.addShape('text', {
        name: 'label',
        attrs: {
          text: label,
          x: midPoint.x,
          y: midPoint.y,
          fontFamily: 'Roboto Mono, monospace',
          fontStyle: 'italic',
          fontSize: 11,
          textAlign: 'center',
          textBaseline: 'middle',
          fill: foreground,
        },
      });
      const { width, height, x, y } = text.getBBox();
      rect.attr('width', width + 5);
      rect.attr('height', height + 5);
      const rotation = textRotation(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
      if (
        width > 30 &&
        width < distance(startPoint.x, startPoint.y, endPoint.x, endPoint.y) - 20
      ) {
        rect.rotateAtPoint(midPoint.x, midPoint.y, rotation);
        text.rotateAtPoint(midPoint.x, midPoint.y, rotation);
      }
      rect.attr('x', x - 2.5);
      rect.attr('y', y - 2.5);
    }
    return shape;
  },
});

const TRANSFORM_EDGE = defineShape<TransformEdge, 'transform'>({
  kind: 'transform',
  render: ({
    item,
    renderer,
    config: { startPoint = { x: 0, y: 0 }, endPoint = { x: 0, y: 0 }, colors },
    utils: { colorize },
  }) => {
    const { background } = colors || colorize(item.destination);
    const shape = renderer.addShape('path', {
      name: 'line-background',
      attrs: {
        stroke: background,
        lineWidth: 3,
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x, endPoint.y],
        ],
      },
    });
    renderer.addShape('path', {
      name: 'line-foreground',
      attrs: {
        stroke: '#ffffff',
        lineWidth: 1.5,
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x, endPoint.y],
        ],
      },
    });
    return shape;
  },
});

export function setupG6() {
  return {
    fromGraph: registerShapes({
      nodes: [LOCAL_DATA_NODE, REMOTE_DATA_NODE, FUNCTION_NODE, REVEAL_NODE],
      edges: [ARGUMENT_EDGE, RETURN_EDGE, TRANSFORM_EDGE, REVEAL_EDGE],
    }),
  };
}
