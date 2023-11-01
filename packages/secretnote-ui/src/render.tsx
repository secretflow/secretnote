import { createRoot } from 'react-dom/client';

export function render({
  elem,
  Component,
  props,
}: {
  elem: HTMLElement;
  Component: React.FC;
  props?: Record<string, unknown>;
}) {
  createRoot(elem).render(<Component {...props} />);
}
