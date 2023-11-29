import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router';

import { Navbar } from './Navbar';

const meta: Meta<typeof Navbar> = {
  component: Navbar,
};

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/graph']}>
      <Navbar />
    </MemoryRouter>
  ),
};
