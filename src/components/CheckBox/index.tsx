import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

interface CheckBoxItemProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckBox = ({ label, name, checked, onChange }: CheckBoxItemProps) => {
  return (
    <FormControlLabel
      sx={{ height: '20px' }}
      control={<Checkbox checked={checked} onChange={onChange} name={name} />}
      label={label}
    />
  );
};

export default CheckBox;
