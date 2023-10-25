import { SemanticValue } from './typing';
import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
import { Horizontal, Label, Vertical } from './common';
import { LocationSymbol } from './Semantics';
import styled from 'styled-components';

const StyledDescriptions = styled(Descriptions)`
  word-break: keep-all;

  .ant-descriptions-item-label {
    vertical-align: top;
  }
`;

export function ValueDetails({ values }: { values: SemanticValue[] }) {
  const items: Required<DescriptionsProps['items']> = [];
  for (const value of values) {
    let key = value.path.join(' → ');
    if (key.length === 0) {
      key = '.0';
    }
    const label = <code>{key}</code>;
    let children: React.ReactElement;
    if (value.kind === 'driver') {
      children = (
        <Vertical>
          <Horizontal>
            <Label>location: </Label>
            <LocationSymbol location={['Driver']} />
          </Horizontal>
          {'type' in value.snapshot && (
            <Horizontal>
              <Label>type: </Label>
              <code>{value.snapshot.type}</code>
            </Horizontal>
          )}
          {'snapshot' in value.snapshot && (
            <Vertical>
              <Horizontal>
                <Label>snapshot: </Label>
              </Horizontal>
              <pre>
                <code>{value.snapshot.snapshot}</code>
              </pre>
            </Vertical>
          )}
        </Vertical>
      );
    } else {
      children = (
        <Vertical>
          <Horizontal>
            <Label>location: </Label>
            <LocationSymbol location={value.snapshot.location} />
          </Horizontal>
          {'type' in value.snapshot && (
            <Horizontal>
              <Label>type: </Label>
              <code>{value.snapshot.type}</code>
            </Horizontal>
          )}
        </Vertical>
      );
    }
    items.push({ key, label, children });
  }
  return <StyledDescriptions size="small" column={1} bordered items={items} />;
}
