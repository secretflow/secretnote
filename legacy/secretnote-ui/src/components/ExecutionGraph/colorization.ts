/* eslint-disable react/no-is-mounted */
import type * as G6 from '@antv/g6';
import type * as graphlib from '@antv/graphlib';
import Color from 'color';
import { useCallback, useMemo, useState } from 'react';

import type { LogicalLocation } from '../../.openapi-stubs';

import type { TrustedModel } from './types';
import { isTrusted } from './types';
import type { PartitionFunction } from './utils';
import { completePartition, toPureGraph } from './utils';

export type ColorizeFunction<T> = (item: T) => {
  background: string;
  foreground: string;
};

export interface Colorizer<T> {
  colors(): Map<string, { name: string; color: string }>;
  colorize: ColorizeFunction<T>;
}

export class LocationColorizer implements Colorizer<LogicalLocation> {
  private readonly palette: string[];

  private readonly cache = new Map<string, string>();
  private readonly names = new Map<string, string>();

  constructor(palette: string[]) {
    this.palette = palette;
  }

  public colorize(location: LogicalLocation) {
    const key = LocationColorizer.locationKey(location);
    let color = this.cache.get(key);
    if (!color) {
      color = this.makeColor();
      this.cache.set(key, color);
    }
    this.names.set(key, this.locationName(location));
    return { background: color, foreground: this.foreground(color) };
  }

  public colors() {
    return new Map(
      [...this.names.entries()].map(([k, name]) => [
        k,
        { name, color: this.cache.get(k)! },
      ]),
    );
  }

  private locationName(location: LogicalLocation) {
    return `${location.type}[${location.parties.join(', ')}]`;
  }

  public static locationKey(location: LogicalLocation) {
    return [
      location.type,
      ...location.parties,
      ...Object.entries(location.parameters ?? {}).map(([k, v]) => `${k}=${v}`),
    ].join(':');
  }

  protected makeColor() {
    const currentColorCount = this.cache.size;
    const position = currentColorCount % this.palette.length;
    const generation = Math.floor(currentColorCount / this.palette.length);
    if (generation === 0) {
      return this.palette[position];
    }
    const hueShifts = [
      // triadic
      120, 240,
      // tetradic
      90, 180, 270,
    ];
    const hueShift = hueShifts[generation - 1];
    if (hueShift === undefined) {
      throw new Error('Too many colors');
    }
    return new Color(this.palette[position]).rotate(hueShift).hex();
  }

  protected foreground(
    color: string,
    darken = 0.2,
    light = '#ffffff',
    dark = '#1d1d1d',
  ) {
    return new Color(color).darken(darken).isDark() ? light : dark;
  }
}

export function colorizeByLocation(colorize: ColorizeFunction<LogicalLocation>) {
  return (node: TrustedModel) => {
    switch (node.data.kind) {
      case 'function':
        return colorize(node.data.location);
      case 'local':
        return { background: '#1d1d1d', foreground: '#ffffff' };
      case 'remote':
        return colorize(node.data.data.location);
      case 'reveal':
        return { background: '#f04654', foreground: '#ffffff' };
      case 'argument':
        return { background: '#a5aab5', foreground: '#ffffff' };
      case 'return':
        return { background: '#a5aab5', foreground: '#ffffff' };
      case 'transform':
        return colorize(node.data.destination);
      default:
        throw new Error(`Unknown shape kind: ${node.data.kind}`);
    }
  };
}

export function recolorOnHover({
  partition,
  colorize,
}: {
  partition: PartitionFunction;
  colorize: (node: TrustedModel) => { background: string; foreground: string };
}) {
  return (graph: G6.Graph) => {
    const highlight = (id: graphlib.ID) => {
      const g = toPureGraph(graph);
      const { matched, unmatched } = completePartition(g, partition(g, id));

      matched.forEach((k) => {
        const shape = graph.findById(String(k));
        const model = shape.getModel();
        if (isTrusted(model)) {
          const { background, foreground } = colorize(model);
          graph.updateItem(shape, {
            colors: { background, foreground },
          });
        }
      });

      unmatched.forEach((k) => {
        const shape = graph.findById(String(k));
        const model = shape.getModel();
        if (isTrusted(model)) {
          graph.updateItem(shape, {
            colors: { background: '#d3d3d3', foreground: '#ffffff' },
          });
        }
      });
    };

    const reset = () => {
      [...graph.getNodes(), ...graph.getEdges()].forEach((shape) => {
        const model = shape.getModel();
        if (isTrusted(model)) {
          const { background, foreground } = colorize(model);
          graph.updateItem(shape, {
            colors: { background, foreground },
          });
        }
      });
    };

    const onEnter = ({ item }: { item: G6.Item | null }) => {
      if (!item) {
        return;
      }
      highlight(item.getID());
    };

    return {
      enable: () => {
        graph.on('node:mouseenter', onEnter);
        graph.on('node:mouseleave', reset);
      },
      disable: () => {
        graph.off('node:mouseenter', onEnter);
        graph.off('node:mouseleave', reset);
      },
      highlight: (target: graphlib.ID | null) => {
        if (target) {
          highlight(target);
        } else {
          reset();
        }
      },
    };
  };
}

export function useColorizer<T>(
  factory: () => Colorizer<T>,
): Colorizer<T> & { reset: () => void } {
  const [colorizer, setColorizer] = useState(factory);
  const [, setColorCount] = useState(0);

  const colorize = useCallback<ColorizeFunction<T>>(
    (...args) => {
      const color = colorizer.colorize(...args);
      setColorCount(colorizer.colors().size);
      return color;
    },
    [colorizer],
  );

  return useMemo(
    () => ({
      colorize,
      colors: colorizer.colors.bind(colorizer),
      reset: () => {
        setColorCount(0);
        setColorizer(factory);
      },
    }),
    [colorize, colorizer, factory],
  );
}
