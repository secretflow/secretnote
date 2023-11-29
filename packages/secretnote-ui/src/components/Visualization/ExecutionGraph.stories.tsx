import type { Meta, StoryObj } from '@storybook/react';

import { ExecutionGraph } from './ExecutionGraph';
import {
  LinearRegressionContext,
  MillionairesContext,
  RealContext,
} from './VisualizationContext/index.stories';

const meta: Meta<typeof ExecutionGraph> = {
  component: ExecutionGraph,
};

export default meta;

type Story = StoryObj<typeof ExecutionGraph>;

export const LinearRegression: Story = {
  render: () => (
    <div>
      <LinearRegressionContext>
        <ExecutionGraph />
      </LinearRegressionContext>
    </div>
  ),
};

export const Millionaires: Story = {
  render: () => (
    <div>
      <MillionairesContext>
        <ExecutionGraph />
      </MillionairesContext>
    </div>
  ),
};

export const Real: Story = {
  render: () => (
    <div style={{ height: '100%' }}>
      <RealContext>
        <ExecutionGraph />
      </RealContext>
    </div>
  ),
};
