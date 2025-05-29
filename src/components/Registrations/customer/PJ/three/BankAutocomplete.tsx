import Select from 'react-select';
import { Typography, Box } from '@mui/material';

interface BankOption {
  label: string;
  value: string;
  raw: any;
}

interface Props {
  bankList: any[];
  selectedBank: any;
  onChange: (event: any, value: any) => void;
  error: boolean;
}

export default function BankAutocomplete({ bankList, selectedBank, onChange, error }: Props) {
  const options: BankOption[] = bankList.map(bank => ({
    label: bank.name,
    value: bank.name,
    raw: bank,
  }));

  const selectedOption = options.find(
    opt => opt.value === selectedBank?.name || selectedBank?.label,
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        Banco
      </Typography>
      <Select
        options={options}
        value={selectedOption || null}
        onChange={(opt: BankOption | null) => onChange(null, opt?.raw ?? null)}
        placeholder="Selecione um Banco"
        styles={{
          control: (base: React.CSSProperties) => ({
            ...base,
            width: '394px',
          }),
        }}
        isClearable
        isSearchable
        noOptionsMessage={() => 'Nenhum banco encontrado'}
      />
    </Box>
  );
}
