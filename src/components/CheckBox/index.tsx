import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

interface CheckBoxItemProps {
  label: string;
  name: string;
  isDisabled?: boolean;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckBox = ({ label, name, isDisabled, checked, onChange }: CheckBoxItemProps) => {
  return (
    <FormControlLabel
      sx={{ height: '20px' }}
      control={<Checkbox checked={checked} onChange={onChange} name={name} disabled={isDisabled} />}
      label={label}
    />
  );
};

export default CheckBox;
