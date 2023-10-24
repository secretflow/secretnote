import { Button, Modal } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

const Red = styled.span`
  color: red;
`;

/**
 * Primary UI component for user interaction
 */
export const MyButton = ({ label }: { label: string }) => {
  const [counter, setCounter] = useState(0);
  return (
    <>
      <Modal
        open={counter % 2 == 1}
        title="Hello"
        onOk={() => setCounter((i) => i + 1)}
      />
      <Button onClick={() => setCounter((i) => i + 1)}>
        <Red>
          {label} {counter}
        </Red>
      </Button>
    </>
  );
};
