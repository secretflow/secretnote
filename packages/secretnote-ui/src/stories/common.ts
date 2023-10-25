import styled from 'styled-components';

export const Label = styled.em`
  color: ${({ theme }) => theme.colors.text} !important;
`;

export const Vertical = styled.div<{ gap?: string }>`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: ${(props) => props.gap || '0.5rem'};
`;

export const Horizontal = styled.div<{ gap?: string }>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: baseline;
  gap: ${(props) => props.gap || '0.2rem'};
`;
