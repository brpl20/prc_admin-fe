import { TextField, Typography, Box } from '@mui/material';
import { CSSProperties } from 'react';

interface CustomTextFieldProps {
  formData: Record<string, unknown>;
  label?: string;
  name: string;
  length?: number;
  placeholder?: string;
  errorMessage?: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  customValue?: unknown;
  sx?: CSSProperties;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  formData,
  label,
  name,
  length,
  placeholder,
  errorMessage,
  handleInputChange,
  customValue,
  sx,
}) => {
  const value =
    customValue !== undefined && customValue !== null
      ? customValue
      : (formData[name] as string) || '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ...sx }}>
      {label && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <TextField
        id={`outlined-${name}`}
        variant="outlined"
        error={!!errorMessage}
        fullWidth
        type="text"
        name={name}
        size="small"
        inputProps={{
          maxLength: length,
          'data-testid': `textfield-${name}`,
        }}
        value={value}
        autoComplete="off"
        placeholder={placeholder || (label ? `Informe o ${label}` : '')}
        onChange={handleInputChange}
        helperText={errorMessage}
        FormHelperTextProps={{ className: 'ml-2' }}
      />
    </Box>
  );
};

export default CustomTextField;
