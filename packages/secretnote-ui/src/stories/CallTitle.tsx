import styled from 'styled-components';
import { InterpretedCall, InvariantExpression } from './typing';
import { Label, Vertical } from './common';

const Heading = styled.h2`
  font-weight: 600;
`;

const Subheading = styled.h5``;

export function CallSemantics({ destination, semantic }: InvariantExpression) {
  let location = destination[0];
  if (destination.length > 1) {
    location = `${location} [${destination.slice(1).join(', ')}]`;
  }
  return (
    <span>
      <em>{semantic}</em> in <em>{location}</em>
    </span>
  );
}

export function CallTitle({ trace }: { trace: InterpretedCall }) {
  if (trace.expression) {
    return (
      <Vertical gap="0.3rem">
        <Heading>
          <CallSemantics {...trace.expression} />
        </Heading>
        <Subheading>
          from <Label>function</Label>{' '}
          <strong>
            <code>{trace.call.snapshot.name}</code>
          </strong>
          , in{' '}
          <strong>
            <code>{trace.call.snapshot.module}</code>
          </strong>
        </Subheading>
      </Vertical>
    );
  }
  return (
    <Vertical gap="0.3rem">
      <Heading>
        <Label>function</Label> <code>{trace.call.snapshot.name}</code>
      </Heading>
      <Subheading>
        in{' '}
        <strong>
          <code>{trace.call.snapshot.module}</code>
        </strong>
      </Subheading>
    </Vertical>
  );
}
