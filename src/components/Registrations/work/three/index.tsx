import React, { forwardRef, useImperativeHandle } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

import PowerDataGrid from './PowerDataGrid';
import useWorkStepThree from './useWorkStepThree';
import { Notification } from '@/components';
import { Container, LoadingOverlay } from '../one/styles';

export interface IRefWorkStepThreeProps {
  handleSubmitForm: () => void;
}

interface IStepThreeProps {
  nextStep: () => void;
}

const WorkStepThree = forwardRef<IRefWorkStepThreeProps, IStepThreeProps>(({ nextStep }, ref) => {
  const {
    openSnackbar,
    message,
    type,
    powersSelected,
    setPowersSelected,
    filteredPowers,
    loading,
    handleSubmitForm,
  } = useWorkStepThree({ nextStep });

  useImperativeHandle(ref, () => ({ handleSubmitForm }));

  return (
    <>
      {openSnackbar && (
        <Notification open={openSnackbar} message={message} severity={type} onClose={() => {}} />
      )}

      <Container loading={loading}>
        {loading && (
          <LoadingOverlay>
            <CircularProgress size={30} style={{ color: '#01013D' }} />
          </LoadingOverlay>
        )}

        <Box>
          <Typography
            variant="h6"
            sx={{ margin: '8px' }}
            style={{ color: powersSelected.length <= 0 ? '#FF0000' : 'black' }}
          >
            {'Poderes'}
          </Typography>

          <PowerDataGrid
            loading={loading}
            powersSelected={powersSelected}
            filteredPowers={filteredPowers}
            setPowersSelected={setPowersSelected}
          />
        </Box>
      </Container>
    </>
  );
});

export default WorkStepThree;
