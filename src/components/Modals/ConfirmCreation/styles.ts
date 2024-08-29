import Box from '@mui/material/Box';
import styled from 'styled-components';
import { colors } from '@/styles/globals';

export const Content = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 440px;
  background-color: ${colors.white};
  padding: 16px;
`;

export const InputContainer = styled.div<any>`
  opacity: ${({ showInput }) => (showInput ? 1 : 0)};
  max-height: ${({ showInput }) => (showInput ? '100px' : 0)};
  overflow: hidden;
  transition: opacity 0.3s, max-height 0.3s;
`;

export const Input = styled.div<any>`
  width: 292px;

  input {
    padding: 0;
    width: 100%;
    height: 40px;
    padding: 0 5px;
  }
`;
