import styled from 'styled-components';
import { colors } from '@/styles/globals';

export const Container = styled.div`
  width: 100%;
  display: flex;
  min-height: 348px;

  .inputContainer {
    width: 100%;
    margin-top: 16px;
    flex-direction: column;
  }


`;

export const Input = styled.div`
  .MuiFormControl-root {
    width: 100%;
  }

  #percentage {
    :placeholder {
      color: ${colors.primary};
    }
  }
`;
