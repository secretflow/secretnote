import type { Meta } from '@storybook/react';

import type { VisualizationProps } from '@/.openapi-stubs';

import millionaires from './millionaires.story.json';
import real from './real.story.json';
import spu_lr from './spu_lr.story.json';

import { VisualizationContextProvider } from './index';

const meta: Meta<typeof VisualizationContextProvider> = {
  component: VisualizationContextProvider,
};

export default meta;

export const MillionairesContext = ({ children }: React.PropsWithChildren) => {
  return (
    <VisualizationContextProvider {...(millionaires as VisualizationProps)}>
      {children}
    </VisualizationContextProvider>
  );
};

export const LinearRegressionContext = ({ children }: React.PropsWithChildren) => {
  return (
    <VisualizationContextProvider {...(spu_lr as VisualizationProps)}>
      {children}
    </VisualizationContextProvider>
  );
};

export const RealContext = ({ children }: React.PropsWithChildren) => {
  return (
    <VisualizationContextProvider {...(real as VisualizationProps)}>
      {children}
    </VisualizationContextProvider>
  );
};
