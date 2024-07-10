import styled from 'styled-components';
import { colors } from '@/styles/globals';

export const Container = styled.div<any>`
  min-height: 348px;

  .MuiInputBase-root {
    height: 40px;
  }

  .flagError {
    margin-left: 4px;
    color: ${colors.red};
  }
`;

export const Input = styled.input<any>`
  width: 314px;
  height: 40px;
  padding-left: 8px;

  border: 1px solid ${colors.icons};

  font-size: 16px;
  font-weight: 300;
  color: ${colors.black};
`;

export const OptionsArea = styled.div`
  border: 1px solid ${colors.icons};
  margin-left: 29px;

  width: 100%;
  min-height: 348px;
  padding: 10px;
`;
