import { colors } from '@/styles/globals';
import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  min-height: 348px;
  margin-top: 16px;
`;

export const ColumnContainer = styled.div`
  width: 394px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BirthdayContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
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

  scrollbar-color: #eeeeee #2a3f54;
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
