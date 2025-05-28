import { Flex } from '@/styles/globals';
import { Autocomplete, TextField, Typography } from '@mui/material';

interface CustomerSelectionProps {
  customersList: Array<{ id: string; attributes?: { name?: string } }>;
  customerSelectedList: Array<{ id: string; attributes?: { name?: string } }>;
  handleCustomersSelected: (
    customers: Array<{ id: string; attributes?: { name?: string } }>,
  ) => void;
  error?: string;
}

export const CustomerSelection = ({
  customersList,
  customerSelectedList,
  handleCustomersSelected,
  error,
}: CustomerSelectionProps) => {
  return (
    <Flex style={{ flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ marginBottom: '8px', marginTop: '16px' }}>
        Cliente
      </Typography>
      <Autocomplete
        multiple
        limitTags={1}
        id="multiple-limit-tags"
        options={customersList}
        getOptionLabel={option => `${option.id} - ${option?.attributes?.name || ''}`}
        renderInput={params => (
          <TextField
            placeholder="Selecione um Cliente"
            {...params}
            size="small"
            error={!!error}
            helperText={error}
            FormHelperTextProps={{ className: 'ml-2' }}
          />
        )}
        sx={{ width: '398px', backgroundColor: 'white', zIndex: 1 }}
        noOptionsText="Nenhum Cliente Encontrado"
        onChange={(_, customers) => handleCustomersSelected(customers)}
        value={customerSelectedList}
      />
    </Flex>
  );
};
