import type { Meta, StoryObj } from '@storybook/react';

import {
  LinearRegressionContext,
  MillionairesContext,
  RealUserlandContext,
  MillionairesBobContext,
  MillionairesAliceContext,
} from '../VisualizationContext/index.stories';

import { ExecutionGraph } from '.';

const meta: Meta<typeof ExecutionGraph> = {
  component: ExecutionGraph,
};

export default meta;

type Story = StoryObj<typeof ExecutionGraph>;

export const LinearRegression: Story = {
  render: () => (
    <div className="jp-LinkedOutputView" style={{ height: '100vh' }}>
      <LinearRegressionContext>
        <ExecutionGraph />
      </LinearRegressionContext>
    </div>
  ),
};

export const Millionaires: Story = {
  render: () => (
    <div className="jp-LinkedOutputView" style={{ height: '100vh' }}>
      <MillionairesContext>
        <ExecutionGraph />
      </MillionairesContext>
    </div>
  ),
};

export const MillionairesA: Story = {
  render: () => (
    <div className="jp-LinkedOutputView" style={{ height: '100vh' }}>
      <MillionairesAliceContext>
        <ExecutionGraph />
      </MillionairesAliceContext>
    </div>
  ),
};

export const MillionairesB: Story = {
  render: () => (
    <div className="jp-LinkedOutputView" style={{ height: '100vh' }}>
      <MillionairesBobContext>
        <ExecutionGraph />
      </MillionairesBobContext>
    </div>
  ),
};

export const RealUserland: Story = {
  render: () => (
    <div className="jp-LinkedOutputView" style={{ height: '100vh' }}>
      <RealUserlandContext>
        <ExecutionGraph />
      </RealUserlandContext>
    </div>
  ),
};
