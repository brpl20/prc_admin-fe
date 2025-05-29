import { Box, TextField, Typography } from '@mui/material';

interface Props {
  formData: {
    agency: string;
    op: string;
    account: string;
    pix: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BankFormInputs({ formData, onChange, errors }: Props) {
  const renderField = (
    label: string,
    name: string,
    placeholder: string,
    width: string = '100%',
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {label}
      </Typography>
      <TextField
        name={name}
        size="small"
        fullWidth
        placeholder={placeholder}
        value={formData[name as keyof typeof formData]}
        onChange={onChange}
        error={!!errors[name]}
      />
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', gap: '16px' }}>
        {renderField('Agência', 'agency', 'Número da agência')}
        {renderField('Operação', 'op', 'Op.', '100px')}
        {renderField('Conta', 'account', 'Número da conta')}
      </div>
      <Box>{renderField('Cadastrar Chave Pix', 'pix', 'Informe a chave')}</Box>
    </>
  );
}
