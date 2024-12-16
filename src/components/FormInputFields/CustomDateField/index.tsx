import { Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';
import dayjs, { Dayjs } from 'dayjs';

interface CustomDateFieldProps {
  formData: any;
  label: string;
  name: string;
  errorMessage?: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomDateField: React.FC<CustomDateFieldProps> = ({
  formData,
  label,
  name,
  errorMessage,
  handleInputChange,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
      {label}
    </Typography>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={dayjs(formData[name] || null)} // Garante que o valor seja um Dayjs ou null
        onChange={dateObject => {
          if (!dateObject || !dayjs(dateObject).isValid()) return;

          // Garante que o dateObject é um Dayjs
          const validDate = dayjs(dateObject);

          // Extract year, month, and day from the dayjs object
          const year = validDate.year();
          const month = (validDate.month() + 1).toString().padStart(2, '0'); // 1-based and two digits
          const day = validDate.date().toString().padStart(2, '0');

          const formattedDate = `${year}-${month}-${day}`;

          // Create a synthetic event to be compatible with handleInputChange
          const syntheticEvent = {
            target: {
              name: name,
              value: formattedDate,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          handleInputChange(syntheticEvent);
        }}
        slotProps={{
          textField: {
            error: !!errorMessage,
            fullWidth: true,
            helperText: errorMessage,
            FormHelperTextProps: { className: 'ml-2' },
            size: 'small',
            variant: 'outlined',
          },
        }}
      />
    </LocalizationProvider>
  </div>
);

export default CustomDateField;
