import React from 'react';
import { FormControlLabel, Radio, Typography } from '@mui/material';
import CustomTooltip from '@/components/Tooltip';
import { MdOutlineInfo } from 'react-icons/md';

const options = [
  {
    value: 'work',
    label: 'Trabalho',
    tooltip: 'Geralmente para procedimentos por valor fixo e diligências.',
  },
  {
    value: 'success',
    label: 'Êxito',
    tooltip: 'Contrato de risco pago de acordo com os benefícios recebidos pelo cliente em %.',
  },
  {
    value: 'both',
    label: 'Ambos',
    tooltip: 'Combinação entre honorários fixos e percentuais.',
  },
  {
    value: 'bonus',
    label: 'Pro-bono',
    tooltip: 'Atuação Pro Bono, ou seja, sem cobrança de honorários.',
  },
];

interface HonoraryTypeSelectionProps {
  honoraryType: string;
  onChange: (value: string) => void;
  error?: string;
}

export const HonoraryTypeSelection: React.FC<HonoraryTypeSelectionProps> = ({
  honoraryType,
  onChange,
  error,
}) => {
  const handleChange = (value: string) => {
    onChange(honoraryType !== value ? value : '');
  };

  return (
    <div className="type-selection">
      <div className="flex">
        <Typography
          variant="h6"
          sx={{ marginBottom: '8px', fontSize: '1.1rem' }}
          style={{ color: error ? '#FF0000' : 'black' }}
        >
          Honorários de Trabalho ou Êxito
        </Typography>
        {error && <span className="error-flag">*</span>}
      </div>

      {options.map(option => (
        <div key={option.value} className="flex items-center">
          <FormControlLabel
            control={
              <Radio
                size="small"
                value={option.value}
                checked={honoraryType === option.value}
                onChange={() => handleChange(option.value)}
              />
            }
            label={option.label}
            sx={{ width: '200px' }}
          />
          <CustomTooltip title={option.tooltip} placement="right">
            <span
              style={{
                display: 'flex',
              }}
            >
              <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
            </span>
          </CustomTooltip>
        </div>
      ))}
    </div>
  );
};
