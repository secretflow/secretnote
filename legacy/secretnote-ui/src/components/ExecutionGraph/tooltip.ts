import type * as G6 from '@antv/g6';
import * as d3 from 'd3';
import YAML from 'yaml';

import type {
  RemoteObjectNode,
  LocalObjectNode,
  FunctionNode,
} from '../../.openapi-stubs';
import type { SnapshotReifier } from '../../utils/reify';
import { wrap } from '../../utils/string';

import { isTrusted } from './types';

type Selection<T, E extends d3.BaseType = HTMLDivElement> = d3.Selection<
  E,
  T,
  null,
  undefined
>;

type TooltipProps<T, E extends d3.BaseType = HTMLDivElement> = {
  root: Selection<T, E>;
  reify: SnapshotReifier;
};

function tooltipHeader<T>(
  root: TooltipProps<T>['root'],
  text: string | d3.ValueFn<HTMLElement, T, string>,
) {
  root.append('strong').text(text).style('font-size', '0.9rem');
  root
    .append('hr')
    .style('margin', '3px 0')
    .style('border', 0)
    .style('border-top', '1px solid #d3d3d3');
}

function attributes<T>(
  root: TooltipProps<T>['root'],
  items: [
    string | d3.ValueFn<HTMLElement, T, string | number | boolean>,
    string | d3.ValueFn<HTMLElement, T, string | number | boolean>,
  ][],
) {
  const container = root
    .append('div')
    .style('display', 'grid')
    .style('gap', '.3rem')
    .style('min-width', '0')
    .style('grid-template-columns', '2fr 8fr')
    .style('grid-auto-flow', 'row')
    .style('align-items', 'baseline');
  items.forEach(([name, value]) => {
    container.append('span').text(name);
    container
      .append('code')
      .style('font-weight', 700)
      .style('word-break', 'break-all')
      .style('background', 'none')
      .text(value);
  });
}

function codeBlock<T>(
  root: TooltipProps<T>['root'],
  value: string | d3.ValueFn<HTMLElement, T, string | number | boolean>,
) {
  root
    .append('div')
    .style('background', '#f5f5f5')
    .style('margin', '6px 0 0')
    .style('max-height', '10vh')
    .style('overflow', 'auto')
    .style('padding', '6px')
    .append('pre')
    .style('background', 'none')
    .style('overflow', 'auto')
    .style('white-space', 'pre')
    .style('word-break', 'break-all')
    .text(value);
}

export function remoteObjectTooltip({ root }: TooltipProps<RemoteObjectNode>) {
  tooltipHeader(root, (d) => `Remote object #${d.data.numbering || 'numbering ?'}`);
  attributes(root, [
    ['Device', (d) => d.data.location.type],
    [
      (d) => (d.data.location.parties.length > 1 ? 'Parties' : 'Party'),
      (d) => d.data.location.parties.join(', '),
    ],
  ]);
  const params = root.datum().data.location.parameters || {};
  if (Object.keys(params).length > 0) {
    codeBlock(root, () => YAML.stringify({ properties: params }, { indent: 2 }));
  }
}

export function localObjectTooltip({ root, reify }: TooltipProps<LocalObjectNode>) {
  tooltipHeader(root, 'Local value');

  const value = reify(undefined, root.datum().data);
  const node = root.datum();

  switch (value?.kind) {
    case 'object':
    case 'list':
    case 'dict':
      attributes(root.datum(value), [
        ['Name', node.data.name || '?'],
        ['Type', (d) => wrap(d.type, '.', 30)],
      ]);
      codeBlock(root.datum(value), (d) => d.snapshot);
      break;
    case 'none':
      attributes(root.datum(value), [
        ['Name', node.data.name || '?'],
        ['Value', 'None'],
      ]);
      break;
    case 'function':
      attributes(root.datum(value), [
        ['Function', (d) => wrap(d.name, '.', 32)],
        ['Module', (d) => wrap(d.module || '?', '.', 32)],
        ['File', (d) => wrap(d.filename || '?', '/', 32)],
        ['Line', (d) => d.firstlineno || '?'],
      ]);
      codeBlock(root.datum(value), (d) => d.source || '(no source)');
      break;
  }
}

export function functionTooltip({ root, reify }: TooltipProps<FunctionNode>) {
  tooltipHeader(root, 'Code execution');

  attributes(root, [
    ['Device', (d) => `${d.location.type}[${d.location.parties.join(', ')}]`],
    ['Frame #', (d) => d.epoch],
  ]);

  const func = reify('function', root.datum().function);

  if (!func) {
    return;
  }

  attributes(root.datum(func), [
    ['Function', (d) => wrap(d.name, '.', 32)],
    ['Module', (d) => wrap(d.module || '?', '.', 32)],
    [
      'File',
      (d) => `${wrap(d.filename || '?', '/', 32)}, line ${d.firstlineno || '?'}`,
    ],
  ]);

  codeBlock(root.datum(func), (d) => d.source || '(no source, likely a C function)');
}

export function tooltip(model: G6.ModelConfig, reify: SnapshotReifier): string {
  if (!isTrusted(model)) {
    return '';
  }
  const div = document.createElement('div');
  const root = d3.select(div);
  const { data } = model;
  switch (data.kind) {
    case 'remote':
      remoteObjectTooltip({ root: root.datum(data), reify });
      break;
    case 'local':
      localObjectTooltip({ root: root.datum(data), reify });
      break;
    case 'function':
      functionTooltip({ root: root.datum(data), reify });
      break;
    default:
      break;
  }
  root
    .style('box-sizing', 'border-box')
    .style('padding', '10px')
    .style('margin', '0')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'stretch')
    .style('gap', '.3rem')
    .style('font-size', '0.8rem')
    .style('color', '#333')
    .style('border-radius', '4px')
    .style('background-color', '#fff')
    .style('min-width', '200px')
    .style('max-width', '25vw')
    .style(
      'box-shadow',
      '0px 1px 2px -2px rgba(0,0,0,0.08), 0px 3px 6px 0px rgba(0,0,0,0.06), 0px 5px 12px 4px rgba(0,0,0,0.03)',
    );
  if (div.childNodes.length === 0) {
    return '';
  }
  return div.outerHTML;
}
