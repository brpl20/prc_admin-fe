import styled, { css } from 'styled-components';
import { createTheme } from '@mui/material/styles';

interface titleProps {
  showTitle: boolean;
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2A3F54',
    },

    secondary: {
      main: '#26B99A',
    },

    success: {
      main: '#2e7d32',
    },

    error: {
      main: '#CD0D15',
    },

    warning: {
      main: '#FFC107',
    },

    info: {
      main: '#1D79FB',
    },

    mode: 'light',
  },
});

export const colors = {
  primary: '#2A3F54',
  primaryOpacity: 'rgba(42, 63, 84, 0.3)',
  secondary: '#1D79FB',
  tertiary: '#7F7F7F',
  quartiary: '#26B99A',
  quartiaryHover: '#1D7E68',
  info: '#64B6F7',
  green: '#16924f',
  greenPill: '#14B8A6',
  border: '#DADCE0',
  icons: '#41414D',
  text: '#A8A8B3',
  background: '#EEEEEE',
  black: '#121214',
  white: '#FFFFFF',
  red: '#a7282e',
  orange: '#FFB020',
};

export const border = {
  primary: `1px solid ${colors.primary}`,
  shadow: `0px 5px 5px -3px rgba(0, 0, 0, 0.2),
  0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)`,
};

export const HeaderPageTitle = styled.div<any>`
  font-size: 26px;
  font-weight: 500;
  margin-bottom: 20px;
  color: ${colors.primary};
`;

export const PageTitle = styled(HeaderPageTitle)<titleProps>`
  opacity: ${({ showTitle }) => (!showTitle ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  visibility: ${({ showTitle }) => (!showTitle ? 'visible' : 'hidden')};
`;

export const Title = styled.label<any>`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.secondary};
`;

export const Flex = styled.div<any>`
  display: flex;
`;

export const CustomerTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: ${colors.primary};
`;

export const DescriptionText = styled.label<any>`
  font-size: 16px;
  font-weight: 300;

  min-width: 110px;
  text-transform: none;
  color: ${colors.white};
`;

export const Input = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  height: 36px;
  padding: 8px;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: ${colors.white};
  border: 1px solid ${colors.border};

  svg {
    color: ${colors.icons};
    margin-right: 4px;
  }

  input {
    width: 100%;
    height: 100%;
    border: none;
    font-size: 1rem;
    color: ${colors.black};
    background-color: ${colors.white};

    :focus-visible {
      outline: none;
      border: none;
    }

    ::placeholder {
      color: ${colors.tertiary};
    }
  }
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

export const Container = styled.div<any>`
  margin-top: 84px;
  padding: 0 40px;
  overflow-x: auto;

  .ml-8 {
    margin-right: 8px;
  }
`;

export const ContentContainer = styled.div<any>`
  padding: 20px;
  min-width: 900px;
  max-width: 1600px;
  margin-bottom: 20px;
  background-color: ${colors.white};

  .MuiDataGrid-row:hover {
    background-color: ${colors.primaryOpacity};
  }

  .status-cell {
    font-size: 14px;
  }

  .pending,
  .late,
  .completed {
    width: 100px;
    height: 24px;
    display: flex;
    color: ${colors.white};
    font-weight: 500;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
  }

  .pending {
    background-color: ${colors.orange};
  }

  .late {
    background-color: ${colors.red};
  }

  .completed {
    background-color: ${colors.greenPill};
  }
`;

export const SelectContainer = styled.div<any>`
  width: 180px;
  height: 36px;
  display: flex;
  justify-content: center;
  cursor: pointer;

  padding: 8px 19px;
  border-radius: 4px;
  background-color: ${colors.quartiary};

  h6 {
    font-size: 16px;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .title {
    width: 100%;
    color: ${colors.white};
    justify-content: space-between;
  }

  .selectItemsContainer {
    width: 180px;
    margin-top: 36px;
    position: absolute;
    padding: 8px;
    flex-direction: column;

    z-index: 1;
    border-radius: 4px;
    box-shadow: ${border.shadow};
    background-color: ${colors.quartiary};

    a {
      width: 100%;
      text-decoration: none;
      color: ${colors.white};
    }

    .item {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      justify-content: space-between;

      :hover {
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  ${props =>
    props.isOpen &&
    css`
      .arrow {
        rotate: 180deg;
      }

      .close {
        display: block;
      }
    `}
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  margin: 20px 0;
  background-color: ${colors.primary};
`;
