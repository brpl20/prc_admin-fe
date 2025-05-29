import { Autocomplete, TextField, Typography } from '@mui/material';
import { MdOutlineInfo } from 'react-icons/md';
import CustomTooltip from '@/components/Tooltip';
import { Flex } from '@/styles/globals';

interface OfficeSelectionProps {
  offices: any[];
  officesSelected: any[];
  handleSelectedOffice: (value: any[]) => void;
  legalPersonError: boolean;
}

export const OfficeSelection = ({
  offices,
  officesSelected,
  handleSelectedOffice,
  legalPersonError,
}: OfficeSelectionProps) => (
  <Flex className="inputContainer">
    <Flex style={{ alignItems: 'center' }}>
      <Typography display={'flex'} alignItems={'center'} variant="h6" style={{ height: '40px' }}>
        {'Escritório'}
      </Typography>
      <CustomTooltip
        title="Advogado ou Advogados atuando dentro de uma pessoa jurídica."
        placement="right"
      >
        <span style={{ display: 'flex' }}>
          <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
        </span>
      </CustomTooltip>
    </Flex>

    <Autocomplete
      multiple
      limitTags={1}
      id="multiple-limit-tags"
      options={offices}
      getOptionLabel={option => option.attributes.name}
      renderInput={params => (
        <TextField
          placeholder="Selecione um Escritório"
          {...params}
          size="small"
          error={legalPersonError}
        />
      )}
      sx={{ width: '398px', backgroundColor: 'white', zIndex: 1 }}
      noOptionsText="Não Encontrado"
      onChange={(event, value) => handleSelectedOffice(value)}
      value={officesSelected}
    />
    <Typography variant="caption" sx={{ marginTop: '4px' }} gutterBottom>
      {'* Indique ao menos um advogado para cada escritório selecionado.'}
    </Typography>
  </Flex>
);
