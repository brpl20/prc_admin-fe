import styled, { css } from 'styled-components';
import { colors } from '@/styles/globals';

interface IButtonProps {
  isLoading: boolean;
}

interface IFormProps {
  isErrored: boolean;
}

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: ${colors.primary};

  .imageContainer {
    display: flex;

    img {
      object-fit: contain;
    }
  }

  @media (min-width: 640px) {
    padding: 3rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 3rem 4rem;
  }
`;

export const Content = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  width: 500px;
  max-width: 554px;
  border-radius: 4px;
  padding: 0 64px 32px 64px;

  background-color: ${colors.white};

  a {
    text-decoration: none;
  }
`;

export const Input = styled.input<IFormProps>`
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid ${colors.border};

  color: ${colors.text};
  outline: none;
  transition-duration: 0.15s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  line-height: 1.5;

  ${props =>
    props.isErrored &&
    css`
      border-bottom-color: ${colors.red};

      &:focus {
        border-bottom-color: ${colors.red};
    `}

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.4rem 0.6rem;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  width: 100%;
  max-width: 640px;
`;

export const Button = styled.button<IButtonProps>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 40px;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;

  color: ${colors.white};
  background-color: ${colors.green};

  border-radius: 4px;
  border-color: transparent;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #00875f;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }

  ${props =>
    props.isLoading &&
    css`
      &::before {
        content: '';
        display: block;
        position: absolute;
        top: -10px;
        left: -10px;
        width: calc(100% + 20px);
        height: calc(100% + 20px);
        border: 2px solid transparent;
        border-radius: 4px;
        animation: pulse 1.5s ease-in-out infinite;
      }
    `}

  ${props =>
    props.isLoading &&
    css`
      &::before {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-width: 4px;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(41, 167, 68, 0.7);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
        }
        100% {
          transform: scale(1.3);
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
        }
      }
    `}
`;

export const GoogleLoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 16px;
  height: 40px;
  width: 100%;

  background-color: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  color: ${colors.text};
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.border};
`;
