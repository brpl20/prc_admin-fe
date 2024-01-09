import styled from 'styled-components';
import { colors } from '@/styles/globals';

export const Container = styled.div`
  display: flex;

  bottom: 0;
  width: 100%;
  height: 198px;
  padding: 28px 0;
  margin-top: 64px;
  background-color: ${colors.white};

  .content {
    width: 100%;
    min-width: 900px;
    max-width: 1600px;
    justify-content: space-around;
  }

  .links {
    text-decoration: none;
    color: ${colors.black};
  }
`;
