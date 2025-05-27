import { FormControlLabel, Radio } from '@mui/material';
import { ChangeEvent } from 'react';

interface Option {
  value: string;
  label: string;
}

interface RadioOptionsProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioOptions: React.FC<RadioOptionsProps> = ({
  options,
  selectedValue,
  onChange,
  className,
}) => (
  <div className={`flex ${className}`}>
    {options.map(option => (
      <div key={option.value}>
        <FormControlLabel
          control={
            <Radio
              size="small"
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            />
          }
          label={option.label}
        />
      </div>
    ))}
  </div>
);
