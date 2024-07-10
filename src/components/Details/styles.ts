import styled, { css } from 'styled-components';

export const Container = styled.div<any>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 0.5rem;
`;

export const DetailsWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  gap: 32px;
  background-color: #fff;
  border-radius: 4px;
`;

export const ButtonShowData = styled.button`
  color: #2a3f54;
  font-size: 1.2rem;
  outline: none;
  border: none;
  background-color: #fff;
  cursor: pointer;

  span {
    font-size: 24px;
    font-weight: 500;
  }
`;

export const ButtonShowContact = styled.button`
  font-size: 20px;
  color: #526b8e;
  font-weight: 400;
  outline: none;
  border: none;
  background-color: #fff;
  cursor: pointer;
  margin: 0;
  padding: 0;
`;

export const ContainerDetails = styled.div<any>`
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-radius: 0.5rem;
`;

export const Flex = styled.div<any>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Box = styled.div`
  display: flex;
  flex-direction: column;
`;

export const GridInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
`;

export const BoxInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 500;
  color: #000;
  margin: 0;
  margin-top: 0.5rem;
`;
