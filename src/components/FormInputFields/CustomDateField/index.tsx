import { Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React from "react";

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
                value={formData[name]}
                onChange={(dateObject) => {
                    if (!dateObject) return;

                    // Extract year, month, and day from the dayjs object
                    const year = dateObject.$y;
                    const month = (dateObject.$M + 1).toString().padStart(2, '0'); // 1-based and two digits
                    const day = dateObject.$D.toString().padStart(2, '0');

                    const formattedDate = `${year}-${month}-${day}`;

                    // Create a synthetic event to be compatible with handleInputChange
                    const syntheticEvent = {
                        target: {
                            name: name,
                            value: formattedDate
                        }
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
                    }
                }}
            />

        </LocalizationProvider>
    </div>
);

export default CustomDateField;