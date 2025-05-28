import React from 'react';
import { Typography } from '@mui/material';
import { percentMask } from '@/utils/masks';
import { Input } from './styles';

interface PercentHonoraryInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const PercentHonoraryInput: React.FC<PercentHonoraryInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value || '';
    onChange(percentMask(inputValue));
  };

  return (
    <div className="input-section">
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        Valor de Honorários Percentuais
      </Typography>
      <Input
        style={{ borderColor: error ? '#FF0000' : 'black' }}
        placeholder="%"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};
