import Select from 'react-select';
import { Typography } from '@mui/material';
import { MdOutlineInfo } from 'react-icons/md';
import CustomTooltip from '@/components/Tooltip';
import { Flex } from '@/styles/globals';

interface LawyerSelectProps {
  title: string;
  tooltip: string;
  value: string | number | null;
  options: any[];
  onChange: (value: any) => void;
  error?: boolean;
  placeholder?: string;
}

export const LawyerSelect = ({
  title,
  tooltip,
  value,
  options,
  onChange,
  error = false,
  placeholder = 'Informe o Advogado',
}: LawyerSelectProps) => {
  const selectedOption = options.find(option => option.id === value);

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: error ? '#d32f2f' : base.borderColor,
      minHeight: '40px',
      boxShadow: state.isFocused ? (error ? '0 0 0 1px #d32f2f' : '0 0 0 1px #2684FF') : 'none',
      '&:hover': {
        borderColor: error ? '#d32f2f' : base.borderColor,
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <Flex className="inputContainer">
      <Flex style={{ alignItems: 'center' }}>
        <Typography display={'flex'} alignItems={'center'} variant="h6" style={{ height: '40px' }}>
          {title}
        </Typography>
        <CustomTooltip title={tooltip} placement="right">
          <span style={{ display: 'flex' }}>
            <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
          </span>
        </CustomTooltip>
      </Flex>

      <Select
        id="lawyer-select"
        value={selectedOption || null}
        options={options}
        getOptionLabel={(option: any) =>
          option?.attributes ? `${option.id} - ${option.attributes.name}` : ''
        }
        getOptionValue={(option: any) => option.id.toString()}
        onChange={(value: any) => onChange(value)}
        placeholder={placeholder}
        noOptionsMessage={() => 'Não Encontrado'}
        styles={customStyles}
        isSearchable
        isClearable
        classNamePrefix="select"
        className={`react-select-container ${error ? 'error' : ''}`}
      />
    </Flex>
  );
};
