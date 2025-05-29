import React from 'react';
import { Typography } from '@mui/material';
import { Input } from './styles';

interface SocialSecurityInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  error?: boolean;
}

export const SocialSecurityInput: React.FC<SocialSecurityInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(e.target.value);
    onChange(inputValue === 0 ? null : Math.min(inputValue, 99));
  };

  return (
    <div className="input-section">
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        Valor de Honorários Previdenciários (Parcelas de Benefícios)
      </Typography>
      <Input
        style={{ borderColor: error ? '#FF0000' : 'black' }}
        placeholder="0"
        type="number"
        min="0"
        max="99"
        value={value || ''}
        onChange={handleChange}
      />
    </div>
  );
};
