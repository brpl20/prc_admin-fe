import styled from 'styled-components';
import { colors } from '@/styles/globals';

export const Container = styled.div<any>`
  .flagError {
    margin-left: 4px;
    color: ${colors.red};
  }
`;

export const InputContainer = styled.div`
  input {
    padding: 0;
    width: 100%;
    height: 40px;
    padding: 0 5px;
  }
`;
