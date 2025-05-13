import styled, { css } from 'styled-components';
import { Box } from '@mui/material';

interface titleProps {
  showTitle: boolean;
}

import { colors, border } from '@/styles/globals';

export const ContentContainer = styled.span``;

export const Container = styled.span`
  min-height: 100vh;

  .MuiDrawer-paperAnchorDockedLeft {
    background-color: ${colors.primary};
  }

  .imgContainer {
    padding: 0 34px 34px;
    border-bottom: 1px solid ${colors.border};
  }

  .subItem {
    justify-content: center;
    margin-top: 0 !important;
  }

  a {
    display: flex;
    position: relative;

    width: 100%;
    text-decoration: none;
    color: ${colors.white};

    padding: 6px 0;
    margin-top: 16px !important;

    .arrowWork {
      transition: transform 0.3s ease;
    }

    :hover {
      .arrow {
        color: ${colors.quartiary};
      }
    }

    .icon {
      margin: 0 16px;
    }

    .arrow {
      margin-left: auto;
      margin-right: 16px;
    }

    :hover {
      text-decoration: none;
    }
  }

  .MuiPaper-root {
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background-color: #01013d;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #eeeeee;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: #b4b4b4;
    }

    scrollbar-color: #01013d;
    scrollbar-width: thin;
  }
`;

export const TitleWrapper = styled('div')<titleProps>`
  display: flex;
  margin-left: 16px;
  align-items: center;

  opacity: ${({ showTitle }) => (showTitle ? '1' : '0')};

  transition: opacity 0.3s ease-in-out;
`;

export const Flex = styled(Box)`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

export const MenuItem = styled(Box)`
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
  border-radius: 4px;
  margin: 0 8px;
  height: 32px;
`;

export const CloseDropdown = styled.div<any>`
  display: none;
  cursor: default;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: transparent;
`;
