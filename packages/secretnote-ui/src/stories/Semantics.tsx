import { Fragment } from 'react';
import type { InvariantExpression, SemanticValue, ObjectLocation } from './typing';
import styled from 'styled-components';

const Math = styled.h3`
  font-family: ${(props) => props.theme.typography.math.fontFamily};
  font-weight: 500;
`;

const UprightEmphasis = styled.span`
  color: ${(props) => props.theme.colors.emphasis};
`;

export function ValueSymbol({ value }: { value: SemanticValue }) {
  if (value.kind === 'driver') {
    return (
      <UprightEmphasis>
        IO
        {value.path.length ? (
          <span>
            (<em>{value.path.slice(-1)}</em>)
          </span>
        ) : (
          ''
        )}
      </UprightEmphasis>
    );
  }
  return <strong>[{value.index}]</strong>;
}

const LocationSymbolText = styled.span`
  font-weight: 500;
  background-color: ${(props) => props.theme.colors.highlight};
`;

export function LocationSymbol({ location }: { location: ObjectLocation }) {
  let device = location[0];
  if (location.length > 1) {
    device = `${device} [${location.slice(1).join(', ')}]`;
  }
  return <LocationSymbolText>{device}</LocationSymbolText>;
}

export function Semantics({ expression }: { expression: InvariantExpression }) {
  return (
    <Math>
      {expression.outputs.map((output, idx) => (
        <Fragment key={output.path.toString()}>
          <ValueSymbol value={output} />
          {idx === expression.outputs.length - 1 ? '' : ', '}
        </Fragment>
      ))}
      <span> ::= </span>
      <em>{expression.semantic}</em>
      <span> in </span>
      <LocationSymbol location={expression.destination} />
      <span> ← </span>
      {expression.inputs.map((input, idx) => (
        <Fragment key={input.path.toString()}>
          <ValueSymbol value={input} />
          {idx === expression.inputs.length - 1 ? '' : ' ← '}
        </Fragment>
      ))}
    </Math>
  );
}
