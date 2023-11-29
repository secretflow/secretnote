import { MemoryRouter } from 'react-router';

import type { VisualizationProps } from '../../.openapi-stubs';

import { Dispatch } from './Dispatch';
import { Navbar } from './Navbar';

export function Visualization(props: VisualizationProps) {
  return (
    <MemoryRouter initialEntries={['/graph']}>
      <Navbar />
      <Dispatch {...props} />
    </MemoryRouter>
  );
}
