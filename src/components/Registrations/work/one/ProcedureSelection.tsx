import CustomTooltip from '@/components/Tooltip';
import { Flex } from '@/styles/globals';
import { Typography, FormControlLabel, Checkbox } from '@mui/material';
import { MdOutlineInfo } from 'react-icons/md';

const PROCEDURE_OPTIONS = [
  { value: 'administrative', label: 'Administrativo' },
  { value: 'judicial', label: 'Judicial' },
  { value: 'extrajudicial', label: 'Extrajudicial' },
];

interface ProcedureSelectionProps {
  selectedProcedures: string[];
  handleProcedureSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: { procedure?: boolean; procedures?: boolean };
}

export const ProcedureSelection = ({
  selectedProcedures,
  handleProcedureSelection,
  errors,
}: ProcedureSelectionProps) => {
  return (
    <Flex style={{ marginTop: '16px', flexDirection: 'column' }}>
      <Flex style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '8px' }}>
        <Typography variant="h6" style={{ color: selectedProcedures.length ? 'black' : '#FF0000' }}>
          Procedimento
        </Typography>
        <CustomTooltip title="Selecione um tipo de procedimento." placement="right">
          <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
        </CustomTooltip>
        {errors.procedure && !selectedProcedures.length && <label className="flagError">*</label>}
      </Flex>
      <Flex style={{ width: '398px', justifyContent: 'space-between' }}>
        {PROCEDURE_OPTIONS.map(option => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                value={option.value}
                checked={selectedProcedures.includes(option.value)}
                onChange={handleProcedureSelection}
              />
            }
            label={option.label}
          />
        ))}
      </Flex>
      {errors.procedures && (
        <span className="text-[#cd0d15] ml-2 text-xs">Selecione ao menos um procedimento.</span>
      )}
    </Flex>
  );
};
