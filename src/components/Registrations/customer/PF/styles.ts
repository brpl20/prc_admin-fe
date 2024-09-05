import { colors } from '@/styles/globals';
import styled from 'styled-components';

export const Container = styled.div<any>`
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
