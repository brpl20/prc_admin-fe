import { Flex } from '@/styles/globals';
import { Typography, Box } from '@mui/material';
import { RadioOptions } from './RadioOptions';
import { SubjectArea } from './SubjectOptionsArea';

interface SubjectSelectionProps {
  role: string;
  selectedSubject: string;
  errors: { subject?: boolean };
  handleSubject: (value: string) => void;
  isVisibleOptionsArea: boolean;
  selectedArea: string;
  handleSelectArea: (value: string) => void;
  compensationsLastYears: string;
  setCompensationsLastYears: (value: string) => void;
  officialCompensation: string;
  setOfficialCompensation: (value: string) => void;
  hasALawsuit: string;
  setHasALawsuit: (value: string) => void;
  gainProjection: string | null;
  handleGainProjection: (value: string | null) => void;
  selectedFile: File[] | null;
  setSelectedFile: (files: File[] | ((prev: File[] | null) => File[] | null) | null) => void;
  openFileSnackbar: boolean;
  setOpenFileSnackbar: (open: boolean) => void;
  otherDescription: string;
  setOtherDescription: (value: string) => void;
}

export const SubjectSelection = ({
  role,
  selectedSubject,
  errors,
  handleSubject,
  isVisibleOptionsArea,
  selectedArea,
  handleSelectArea,
  compensationsLastYears,
  setCompensationsLastYears,
  officialCompensation,
  setOfficialCompensation,
  hasALawsuit,
  setHasALawsuit,
  gainProjection,
  handleGainProjection,
  selectedFile,
  setSelectedFile,
  openFileSnackbar,
  setOpenFileSnackbar,
  otherDescription,
  setOtherDescription,
}: SubjectSelectionProps) => {
  console.log('role:', role);
  const subjectOptions =
    role !== 'counter'
      ? [
          { value: 'administrative_subject', label: 'Administrativo' },
          { value: 'civel', label: 'Cível' },
          { value: 'criminal', label: 'Criminal' },
          { value: 'social_security', label: 'Previdenciário' },
          { value: 'laborite', label: 'Trabalhista' },
          { value: 'tributary', label: 'Tributário' },
          { value: 'tributary_pis', label: 'Tributário Pis/Cofins insumos' },
          { value: 'others', label: 'Outro' },
        ]
      : [
          { value: 'tributary', label: 'Tributário' },
          { value: 'tributary_pis', label: 'Tributário Pis/Cofins insumos' },
        ];

  return (
    <Flex style={{ marginTop: '16px', flex: 1 }}>
      <Box width={'400px'}>
        <Flex>
          <Typography
            variant="h6"
            sx={{ marginBottom: '8px' }}
            style={{ color: selectedSubject ? 'black' : '#FF0000' }}
          >
            Assunto
          </Typography>
          {errors.subject && !selectedSubject && <label className="flagError">*</label>}
        </Flex>

        <RadioOptions
          className="flex-col"
          options={subjectOptions}
          selectedValue={selectedSubject}
          onChange={handleSubject}
        />
      </Box>

      {isVisibleOptionsArea && (
        <SubjectArea
          selectedSubject={selectedSubject}
          selectedArea={selectedArea}
          handleSelectArea={handleSelectArea}
          compensationsLastYears={compensationsLastYears}
          setCompensationsLastYears={setCompensationsLastYears}
          officialCompensation={officialCompensation}
          setOfficialCompensation={setOfficialCompensation}
          hasALawsuit={hasALawsuit}
          setHasALawsuit={setHasALawsuit}
          gainProjection={gainProjection ?? undefined}
          handleGainProjection={value => handleGainProjection(value === '' ? null : value)}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          openFileSnackbar={openFileSnackbar}
          setOpenFileSnackbar={setOpenFileSnackbar}
          otherDescription={otherDescription}
          setOtherDescription={setOtherDescription}
        />
      )}
    </Flex>
  );
};
