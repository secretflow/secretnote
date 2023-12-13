import type { Meta } from '@storybook/react';
import useSWR from 'swr';

import { VisualizationContextProvider } from './index';

const meta: Meta<typeof VisualizationContextProvider> = {
  component: VisualizationContextProvider,
};

export default meta;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const createProvider = (sampleName: string) =>
  function ContextProvider({ children }: React.PropsWithChildren) {
    const { data, isLoading } = useSWR(sampleName, fetcher);
    if (isLoading) {
      return null;
    }
    return (
      <VisualizationContextProvider {...data}>{children}</VisualizationContextProvider>
    );
  };

export const MillionairesContext = createProvider('/millionaires.story.json');

export const MillionairesAliceContext = createProvider(
  '/millionaires.real.alice.story.json',
);

export const MillionairesBobContext = createProvider(
  '/millionaires.real.bob.story.json',
);

export const LinearRegressionContext = createProvider('/spu_lr.story.json');

export const RealUserlandContext = createProvider('/real.userland.story.json');

export const RealContext = createProvider('/real.story.json');

export const SimContext = createProvider('/sim.story.json');
