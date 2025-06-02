import React from 'react';
import { FormControlLabel, Radio, Typography, Select, MenuItem } from '@mui/material';
import CustomTooltip from '@/components/Tooltip';
import { MdOutlineInfo } from 'react-icons/md';

interface ParcelingSectionProps {
  parcelling: boolean;
  onParcellingChange: (value: boolean) => void;
  onInstallmentsChange: (value: string) => void;
}

export const ParcelingSection: React.FC<ParcelingSectionProps> = ({
  parcelling,
  onParcellingChange,
  onInstallmentsChange,
}) => {
  return (
    <div className="parceling-section">
      <div className="flex items-center">
        <Typography variant="h6" style={{ height: '40px' }}>
          Parcelamento
        </Typography>
        <CustomTooltip
          title="No caso dos honorários fixos, especifique se você trabalhou com parcelamento dos valores."
          placement="right"
        >
          <span
            style={{
              display: 'flex',
            }}
          >
            <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
          </span>
        </CustomTooltip>
      </div>

      <div>
        <FormControlLabel
          control={
            <Radio size="small" checked={parcelling} onChange={() => onParcellingChange(true)} />
          }
          label="Sim"
        />
      </div>

      <div>
        <FormControlLabel
          control={
            <Radio
              size="small"
              checked={!parcelling}
              onChange={() => {
                onParcellingChange(false);
                onInstallmentsChange('');
              }}
            />
          }
          label="Não"
        />
      </div>
    </div>
  );
};
