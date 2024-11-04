import React from 'react';
import styled from 'styled-components';
import Tooltip from '@mui/material/Tooltip';

const CustomTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ tooltip: className }} arrow />
))`
  && {
    font-size: 14px;
    background-color: #01013d;

    & .MuiTooltip-arrow {
      color: #01013d;
    }
  }
`;

export default CustomTooltip;
