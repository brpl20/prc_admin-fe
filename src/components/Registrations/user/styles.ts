import styled from 'styled-components';
import { colors } from '@/styles/globals';

export const Container = styled.div`
  margin-top: 84px;
  padding: 0 40px;
  overflow-x: auto;

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

export const BirthdayContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.div`
  font-size: 26px;
  font-weight: 500;
  color: ${colors.primary};
`;
