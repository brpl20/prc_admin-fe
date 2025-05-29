import CustomTooltip from '@/components/Tooltip';
import { Flex } from '@/styles/globals';
import { Autocomplete, TextField, Typography } from '@mui/material';
import { MdOutlineInfo } from 'react-icons/md';

interface DraftWorkSelectionProps {
  draftWorksList: Array<{ id: string; attributes?: { name?: string } }>;
  selectedDraftWork: { id: string; attributes?: { name?: string } } | null;
  setSelectedDraftWork: (draftWork: { id: string; attributes?: { name?: string } } | null) => void;
  disabled?: boolean;
}

export const DraftWorkSelection = ({
  draftWorksList,
  selectedDraftWork,
  setSelectedDraftWork,
  disabled,
}: DraftWorkSelectionProps) => {
  return (
    <Flex style={{ flexDirection: 'column', marginTop: '16px' }}>
      <Flex style={{ flexDirection: 'row', marginBottom: '8px', alignItems: 'center' }}>
        <Typography variant="h6">Pré-Definição</Typography>
        <CustomTooltip
          title="Selecione uma opção para preencher automaticamente o formulário com dados anteriores, simplificando o processo de cadastro."
          placement="right"
        >
          <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
        </CustomTooltip>
      </Flex>
      <Autocomplete
        id="draft-work-selector"
        options={draftWorksList}
        getOptionLabel={option => option?.attributes?.name || ''}
        renderInput={params => (
          <TextField placeholder="Selecione uma Pré-definição" {...params} size="small" />
        )}
        sx={{ width: '398px', backgroundColor: 'white', zIndex: 1 }}
        noOptionsText="Não Encontrado"
        onChange={(_, draftWork) => setSelectedDraftWork(draftWork)}
        value={selectedDraftWork}
        disabled={disabled}
      />
    </Flex>
  );
};
