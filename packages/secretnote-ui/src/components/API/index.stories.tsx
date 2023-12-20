import type { Meta, StoryObj } from '@storybook/react';
import useSWR from 'swr';

import { API } from './index';

const meta: Meta<typeof API> = {
  component: API,
};

export default meta;

type Story = StoryObj<typeof API>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function APIStory({ name }: { name: string }) {
  const { data, isLoading } = useSWR('/dx/schema.json', fetcher);
  if (isLoading) {
    return null;
  }
  return <API name={name} info={data} />;
}

export const PSI: Story = {
  render: () => <APIStory name="secretnote.dx.recipes.preprocessing.psi.PSI" />,
};

export const Impute: Story = {
  render: () => <APIStory name="secretnote.dx.recipes.preprocessing.impute.Impute" />,
};

export const MapCases: Story = {
  render: () => (
    <APIStory name="secretnote.dx.recipes.preprocessing.map_cases.MapCases" />
  ),
};

export const TrainTestSplit: Story = {
  render: () => (
    <APIStory name="secretnote.dx.recipes.preprocessing.train_test_split.TrainTestSplit" />
  ),
};

export const PearsonR: Story = {
  render: () => <APIStory name="secretnote.dx.recipes.stats.pearsonr.PearsonR" />,
};
