import type { Meta, StoryObj } from '@storybook/react';

import { RealContext } from '../VisualizationContext/index.stories';

import { RayFedTransactions } from '.';

const meta: Meta<typeof RayFedTransactions> = {
  component: RayFedTransactions,
};

export default meta;

type Story = StoryObj<typeof RayFedTransactions>;

export const Real: Story = {
  render: () => (
    <div>
      <RealContext>
        <RayFedTransactions />
      </RealContext>
    </div>
  ),
};
