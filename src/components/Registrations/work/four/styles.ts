import { ReactNode } from 'react';
import styled from 'styled-components';

interface ContainerProps {
  loading: boolean;
  children?: ReactNode;
}

export const Container = styled.div<any>`
  width: 100%;
  display: flex;

  .inputContainer {
    width: 398px;
    margin-top: 16px;
    flex-direction: column;
  }

  .tableContainer {
    th,
    td {
      padding: 4px;
    }
  }
`;

export const Input = styled.div`
  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-root {
    padding: 0;
    height: 40px !important;
  }

  input {
    padding: 0;
    width: 100%;
    height: 40px;
    padding: 0 8px;
  }
`;
