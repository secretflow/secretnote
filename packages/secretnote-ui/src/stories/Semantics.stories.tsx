import { Semantics } from './Semantics';

import type { Meta, StoryObj } from '@storybook/react';
import { MOCK_TRACE_WITH_MOVE_SEMANTICS } from './utils';
import { ThemingRoot } from '../theming';

const meta: Meta<typeof Semantics> = {
  title: 'Trace/Semantics',
  component: Semantics,
  parameters: {
    layout: 'centered',
  },
  render: ({ expression }) => (
    <ThemingRoot>
      <Semantics expression={expression} />
    </ThemingRoot>
  ),
};

export default meta;

type Story = StoryObj<typeof Semantics>;

export const Default: Story = {
  args: {
    expression: MOCK_TRACE_WITH_MOVE_SEMANTICS.expression!,
  },
};
