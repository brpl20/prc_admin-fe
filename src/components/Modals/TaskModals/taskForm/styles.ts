import Box from '@mui/material/Box';
import styled from 'styled-components';
import { colors } from '@/styles/globals';
import { CircularProgress } from '@mui/material';

export const Content = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${colors.white};
  padding: 16px;

  .inputContainer {
    margin-top: 16px;
    flex-direction: column;
  }

  .comment-input {
    width: 464px;
    height: 322px !important;

    resize: none;
    padding: 8px;
    border: 1px solid ${colors.tertiary};
    font-family: inherit;
  }
`;

export const Title = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${colors.primary};
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

export const DeadlineContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;

  input {
    width: 180px;
    height: 10px;
  }
`;
