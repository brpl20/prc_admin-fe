import { MenuItem, Select, Typography } from '@mui/material';

export const ParcelingInput: React.FC<{
  instalmentOptions: string[];
  numberOfInstallments: string;
  onInstallmentsChange: (value: string) => void;
}> = ({ instalmentOptions, numberOfInstallments, onInstallmentsChange }) => {
  return (
    <div className="w-[300px]">
      <Typography
        variant="h6"
        sx={{ marginBottom: '8px' }}
        style={{ color: !numberOfInstallments ? '#FF0000' : 'black' }}
      >
        Parcelamento
      </Typography>
      <Select
        displayEmpty
        value={numberOfInstallments}
        onChange={e => onInstallmentsChange(e.target.value)}
        fullWidth
      >
        <MenuItem disabled value="">
          <span className="text-gray-400">1x</span>
        </MenuItem>
        {instalmentOptions.map(value => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};
