import { Flex } from '@/styles/globals';
import { Typography, Radio, Box } from '@mui/material';

interface LawyerRadioGroupProps {
  isLegalPerson: boolean;
  setIsLegalPerson: (value: boolean) => void;
}

export const LawyerRadioGroup = ({ isLegalPerson, setIsLegalPerson }: LawyerRadioGroupProps) => (
  <Box>
    <Typography display={'flex'} alignItems={'center'} variant="h6" marginTop={'16px'}>
      {'Atuar como:'}
    </Typography>
    <Flex style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'start' }}>
      <Flex style={{ display: 'flex', alignItems: 'center' }}>
        <Radio
          checked={isLegalPerson}
          onChange={() => setIsLegalPerson(true)}
          inputProps={{ 'aria-label': 'primary checkbox' }}
          size="small"
          style={{ width: '20px', marginRight: '8px' }}
        />
        <Typography
          variant="subtitle1"
          onClick={() => setIsLegalPerson(true)}
          style={{ cursor: 'pointer' }}
        >
          {'Pessoa Jurídica'}
        </Typography>
      </Flex>
      <Flex style={{ display: 'flex', alignItems: 'center' }}>
        <Radio
          checked={!isLegalPerson}
          onChange={() => setIsLegalPerson(false)}
          inputProps={{ 'aria-label': 'primary checkbox' }}
          size="small"
          style={{ width: '20px', marginRight: '8px' }}
        />
        <Typography
          variant="subtitle1"
          onClick={() => setIsLegalPerson(false)}
          style={{ cursor: 'pointer' }}
        >
          {'Pessoa Física'}
        </Typography>
      </Flex>
    </Flex>
  </Box>
);
