import { CallTitle } from './CallTitle';

import type { Meta, StoryObj } from '@storybook/react';
import { MOCK_TRACE_WITH_MOVE_SEMANTICS, MOCK_TRACE_WITHOUT_SEMANTICS } from './utils';
import { ThemingRoot } from '../theming';

const meta: Meta<typeof CallTitle> = {
  title: 'Trace/CallTitle',
  component: CallTitle,
  parameters: {
    layout: 'centered',
  },
  render: ({ trace }) => (
    <ThemingRoot>
      <CallTitle trace={trace} />
    </ThemingRoot>
  ),
};

export default meta;

type Story = StoryObj<typeof CallTitle>;

export const WithSemantics: Story = {
  args: {
    trace: MOCK_TRACE_WITH_MOVE_SEMANTICS,
  },
};

export const WithoutSemantics: Story = {
  args: {
    trace: MOCK_TRACE_WITHOUT_SEMANTICS,
  },
};
