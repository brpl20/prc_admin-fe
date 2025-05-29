import { Flex } from '@/styles/globals';
import { TextField, Typography } from '@mui/material';
import { ChangeEvent } from 'react';
import { InputContainer } from './styles';

interface ProcessNumberInputProps {
  processNumber: string;
  setProcessNumber: (value: string) => void;
  error?: string;
}

export const ProcessNumberInput = ({
  processNumber,
  setProcessNumber,
  error,
}: ProcessNumberInputProps) => {
  return (
    <Flex style={{ marginTop: '16px', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        Número do Requerimento ou Processo
      </Typography>
      <InputContainer>
        <TextField
          variant="outlined"
          size="small"
          value={processNumber}
          autoComplete="off"
          placeholder="Informe o Número"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setProcessNumber(e.target.value)}
          error={!!error}
        />
      </InputContainer>
      <Typography variant="caption" sx={{ marginTop: '4px' }} gutterBottom>
        * Apenas para casos em que já existe o processo.
      </Typography>
    </Flex>
  );
};
