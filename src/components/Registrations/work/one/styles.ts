import styled from 'styled-components';
import { colors } from '@/styles/globals';
import { ReactNode } from 'react';

interface ContainerProps {
  loading: boolean;
  children?: ReactNode;
}

export const Container = styled.div<ContainerProps>`
  .comment-input {
    width: 100%;
    height: 100% !important;
    resize: vertical;
    border: none;
    padding: 8px;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    outline: none;

    :focus {
      border: none;
    }
  }

  .flagError {
    margin-left: 4px;
    color: ${colors.red};
  }
`;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
`;

export const InputContainer = styled.div`
  width: 398px;

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

export const SubjectOptionsArea = styled.div`
  border: 1px solid ${colors.icons};
  margin-left: 29px;

  width: 100%;
  padding: 10px;
`;

export const Input = styled.input<any>`
  height: 40px;
  padding-left: 8px;

  border: 1px solid ${colors.icons};

  font-size: 16px;
  font-weight: 300;
  margin-top: 8px;
  color: ${colors.black};
`;

export const DropContainer = styled.div`
  flex: 1;
  height: 94px;

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px dashed #ddd;
  cursor: pointer;

  transition: height 0.2s ease;
`;

export const FileList = styled.div`
  flex: 1;
  height: 94px;
  width: 100%;
  margin-left: 10px;
  padding: 8px;

  display: flex;
  flex-direction: column;

  border: 1px solid #ddd;

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
