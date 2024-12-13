import { TextField, Typography } from '@mui/material';

interface CustomTextFieldProps {
  formData: any;
  label: string;
  name: string;
  length?: number;
  placeholder?: string;
  errorMessage?: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  formData,
  label,
  name,
  length,
  placeholder,
  errorMessage,
  handleInputChange,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
      {label}
    </Typography>
    <TextField
      id={`outlined-${name}`}
      variant="outlined"
      error={!!errorMessage}
      fullWidth
      type="text"
      name={name}
      size="small"
      inputProps={{ maxLength: length }}
      value={(formData[name] as string) || ''}
      autoComplete="off"
      placeholder={placeholder ? placeholder : `Informe o ${label}`}
      onChange={handleInputChange}
      helperText={errorMessage}
      FormHelperTextProps={{ className: 'ml-2' }}
    />
  </div>
);

export default CustomTextField;
