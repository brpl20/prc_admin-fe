import Box from '@mui/material/Box';
import styled from 'styled-components';
import { colors } from '@/styles/globals';

interface IDSwitchProps {
  showInput: boolean;
}

export const Content = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 440px;
  background-color: ${colors.white};
  padding: 16px;
`;

export const InputContainer = styled.div<IDSwitchProps>`
  opacity: ${({ showInput }) => (showInput ? 1 : 0)};
  max-height: ${({ showInput }) => (showInput ? '100px' : 0)};
  overflow: hidden;
  transition: opacity 0.3s, max-height 0.3s;
`;

export const Input = styled.div`
  width: 292px;

  input {
    padding: 0;
    width: 100%;
    height: 40px;
    padding: 0 5px;
  }
`;

export const DropContainer = styled.div<{ isDragActive: boolean }>`
  flex: 1;
  height: 100%;

  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;

  border: 2px dashed ${({ isDragActive }) => (isDragActive ? '#4caf50' : '#d5d5da')};
  background-color: ${({ isDragActive }) => (isDragActive ? '#e8f5e9' : '#fafafa')};
  cursor: pointer;

  transition: border 0.2s ease, background-color 0.2s ease;
`;

export const FileList = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  margin-left: 10px;
  padding: 8px;

  display: flex;
  flex-direction: column;

  border-radius: 6px;
  border: 2px solid #d5d5da;

  transition: height 0.2s ease;
  overflow-y: auto;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${colors.tertiary};
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #b4b4b4;
  }

  scrollbar-color: #eeeeee #01013d;
  scrollbar-width: thin;

  .name {
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fileName {
    font-size: 14px;
    font-weight: 300;
    color: ${colors.black};

    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  p {
    font-size: 14px;
    margin: auto;
  }
`;
