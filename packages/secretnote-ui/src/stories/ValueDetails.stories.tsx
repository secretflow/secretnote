import { ValueDetails } from './ValueDetails';

import type { Meta, StoryObj } from '@storybook/react';
import {
  MOCK_TRACE_WITH_MOVE_SEMANTICS,
  MOCK_TRACE_WITH_EXEC_SEMANTICS,
} from './utils';
import { ThemingRoot } from '../theming';

const meta: Meta<typeof ValueDetails> = {
  title: 'Trace/ValueDetails',
  component: ValueDetails,
  parameters: {
    layout: 'centered',
  },
  render: ({ values }) => (
    <ThemingRoot>
      <ValueDetails values={values} />
    </ThemingRoot>
  ),
};

export default meta;

type Story = StoryObj<typeof ValueDetails>;

export const Input1: Story = {
  args: {
    values: MOCK_TRACE_WITH_MOVE_SEMANTICS.expression!.inputs,
  },
};

export const Output1: Story = {
  args: {
    values: MOCK_TRACE_WITH_MOVE_SEMANTICS.expression!.outputs,
  },
};

export const Input2: Story = {
  args: {
    values: MOCK_TRACE_WITH_EXEC_SEMANTICS.expression!.inputs,
  },
};

export const Output2: Story = {
  args: {
    values: MOCK_TRACE_WITH_EXEC_SEMANTICS.expression!.outputs,
  },
};
