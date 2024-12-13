import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

interface CustomSelectFieldProps {
    formData: any;
    label: string;
    name: string;
    options: { label: string, value: string }[];
    errorMessage?: string;
    handleSelectChange: (event: SelectChangeEvent<HTMLInputElement>) => void;
}

const CustomSelectField: React.FC<CustomSelectFieldProps> = ({
    formData,
    label,
    name,
    options,
    errorMessage,
    handleSelectChange
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            {label}
        </Typography>
        <FormControl size="small" error={!!errorMessage} fullWidth>
            <InputLabel shrink={false}>{formData[name] ? '' : `Selecione ${label}`}</InputLabel>
            <Select
                name={name}
                value={formData[name] || ''}
                onChange={handleSelectChange}
            >
                {options.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            {errorMessage && <FormHelperText color="error" className='ml-2'>{errorMessage}</FormHelperText>}
        </FormControl>
    </div>
);

export default CustomSelectField;