import styled from 'styled-components';

export const Container = styled.div<any>`
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
  display: flex;
  flex-direction: column;

  padding: 0 16px;

  .buttonContainer {
    display: flex;
    justify-content: end;
    margin-top: 32px;
  }
`;
