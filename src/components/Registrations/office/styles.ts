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

export const Content = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${colors.white};
  padding: 16px;
  width: 500px;

  .inputContainer {
    margin-top: 16px;
    flex-direction: column;
  }
`;

export const Input = styled.div`
  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-root {
    padding: 0 0 0 4px;
    height: 40px !important;
  }

  input {
    padding: 0;
    width: 100%;
    height: 40px;
    padding: 0 5px;
  }
`;

export const DateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.div`
  font-size: 26px;
  font-weight: 500;
  color: ${colors.primary};
`;
