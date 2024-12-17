import { StrictMode } from 'react';
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
  createRoot(elem).render(
    <StrictMode>
      <Component {...props} />
    </StrictMode>,
  );
}
