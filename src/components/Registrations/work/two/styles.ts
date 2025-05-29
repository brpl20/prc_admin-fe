import styled from 'styled-components';
import { colors } from '@/styles/globals';
import { ReactNode } from 'react';

interface ContainerProps {
  loading: boolean;
  children?: ReactNode;
}

export const Container = styled.div<ContainerProps>`
  margin-top: 16px;
  min-height: 350px;

  .MuiInputBase-root {
    height: 40px;
  }

  .flagError {
    margin-left: 4px;
    color: ${colors.red};
  }
`;

export const Input = styled.input<any>`
  width: 300px;
  height: 40px;
  padding-left: 8px;

  border: 1px solid;
  border-radius: 4px;

  font-size: 16px;
  font-weight: 300;
  color: ${colors.black};
`;

export const OptionsArea = styled.div`
  border: 1px solid ${colors.icons};
  border-radius: 4px;
  margin-left: 29px;

  width: 100%;
  min-height: 348px;
  padding: 10px;
`;
