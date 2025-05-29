import React from 'react';
import { Typography } from '@mui/material';
import { moneyMask } from '@/utils/masks';
import { Input } from './styles';

interface FixedHonoraryInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const FixedHonoraryInput: React.FC<FixedHonoraryInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue ? `R$ ${moneyMask(inputValue)}` : '');
  };

  return (
    <div className="flex flex-col gap-[8px]">
      <Typography variant="h6">Valor de Honorários Fixos</Typography>
      <Input
        style={{ borderColor: error ? '#FF0000' : 'black' }}
        placeholder="R$"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};
