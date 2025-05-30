import styled from 'styled-components';
import { colors } from '@/styles/globals';

export const Container = styled.div<any>`
  margin-top: 84px;
  padding: 0 40px;
  overflow-x: auto;
  width: 100%;
  min-height: 348px;

  .ml-8 {
    margin-right: 8px;
  }

  .MuiStepper-horizontal {
    justify-content: space-between;
  }

  .MuiStepConnector-horizontal {
    display: none !important;
  }
`;

export const Title = styled.div`
  font-size: 26px;
  font-weight: 500;
  color: ${colors.primary};
`;
