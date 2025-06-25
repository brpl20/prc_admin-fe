// components/WorkStepFour.tsx
import {
  useState,
  useContext,
  useEffect,
  forwardRef,
  useCallback,
  useMemo,
  useImperativeHandle,
} from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { WorkContext } from '@/contexts/WorkContext';
import { getAllProfileAdmins } from '@/services/admins';
import { getOfficesWithLaws } from '@/services/offices';
import { Notification } from '@/components';
import { Container } from './styles';
import { LawyerRadioGroup } from './LawyerRadioGroup';
import { OfficeSelection } from './OfficeSelection';
import { LawyerSubTable } from './LawyerSubTable';
import { LawyerSelect } from './LawyerAutocomplete';
import { LoadingOverlay } from '../one/styles';

interface FormData {
  lawyers: any[];
  initial_atendee: string;
  intern: string;
  bachelor: string;
  partner_lawyer: string;
  responsible_lawyer: string;
  physical_lawyer: string;
  physical_lawyer_type: 'legal' | 'physical';
}

interface IRefWorkStepFourProps {
  handleSubmitForm: () => void;
}

interface IStepFourProps {
  nextStep: () => void;
}

const WorkStepFour = forwardRef<IRefWorkStepFourProps, IStepFourProps>(({ nextStep }, ref) => {
  const router = useRouter();
  const { workForm, setWorkForm, updateWorkForm, setUdateWorkForm } = useContext(WorkContext);

  const [loading, setLoading] = useState(true);
  const [openSubTable, setOpenSubTable] = useState(true);
  const [isLegalPerson, setIsLegalPerson] = useState(true);
  const [legalPersonError, setLegalPersonError] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [allLawyers, setAllLawyers] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [officesSelected, setOfficesSelected] = useState<any[]>([]);
  const [selectedLawyers, setSelectedLawyers] = useState<number[]>([]);

  const [formData, setFormData] = useState<FormData>({
    lawyers: [],
    initial_atendee: '',
    intern: '',
    bachelor: '',
    partner_lawyer: '',
    responsible_lawyer: '',
    physical_lawyer: '',
    physical_lawyer_type: 'legal',
  });

  const trainees = useMemo(
    () => allLawyers.filter(lawyer => lawyer.attributes?.role === 'trainee'),
    [allLawyers],
  );

  const paralegals = useMemo(
    () => allLawyers.filter(lawyer => lawyer.attributes?.role === 'paralegal'),
    [allLawyers],
  );

  const lawyers = useMemo(
    () => allLawyers.filter(lawyer => lawyer.attributes?.role === 'lawyer'),
    [allLawyers],
  );

  const handleSelectedOffice = useCallback(
    (newOffices: any[]) => {
      const officesChanged =
        newOffices.length !== officesSelected.length ||
        newOffices.some((office, i) => office.id !== officesSelected[i]?.id);

      if (officesChanged) {
        setSelectedLawyers([]);
      }

      setOfficesSelected(newOffices);
    },
    [officesSelected],
  );

  const handleSelectChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? value.id : '',
    }));
  }, []);

  const handleFormError = useCallback((error: any, customMessage?: string) => {
    console.error('Form Error:', error);
    setMessage(customMessage || error.message || 'Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);
  }, []);

  const handleSubmitForm = useCallback(async () => {
    try {
      if (isLegalPerson) {
        if (officesSelected.length === 0) {
          setLegalPersonError(true);
          handleFormError(new Error('Selecione ao menos um escritório.'));
          return;
        }

        if (selectedLawyers.length === 0) {
          setLegalPersonError(true);
          handleFormError(
            new Error('Selecione ao menos um advogado dos escritórios selecionados.'),
          );
          return;
        }
      } else {
        if (selectedLawyers.length !== 1) {
          setLegalPersonError(true);
          handleFormError(new Error('Selecione exatamente um advogado pessoa física.'));
          return;
        }
      }

      if (!formData.responsible_lawyer) {
        handleFormError(new Error('Selecione um advogado responsável.'));
        return;
      }

      const formDataToSave = {
        ...formData,
        lawyers: selectedLawyers,
        profile_admin_ids: selectedLawyers,
        office_ids: isLegalPerson ? officesSelected.map(office => office.id) : [],
        physical_lawyer_type: isLegalPerson ? 'legal' : 'physical',
      };

      if (router.pathname === '/alterar') {
        const updatedData = { ...updateWorkForm, ...formDataToSave };
        setUdateWorkForm(updatedData);
        saveDataLocalStorage(updatedData);
      } else {
        const updatedData = { ...workForm, ...formDataToSave };
        setWorkForm(updatedData);
        saveDataLocalStorage(updatedData);
      }

      nextStep();
    } catch (err: any) {
      handleFormError(err, err.message);
    }
  }, [
    formData,
    isLegalPerson,
    nextStep,
    officesSelected,
    router.pathname,
    selectedLawyers,
    setUdateWorkForm,
    setWorkForm,
    updateWorkForm,
    workForm,
  ]);

  const saveDataLocalStorage = useCallback((data: any) => {
    localStorage.setItem('WORK/Four', JSON.stringify(data));
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [officesResponse, adminsResponse] = await Promise.all([
        getOfficesWithLaws(),
        getAllProfileAdmins(''),
      ]);
      return {
        offices: officesResponse.data,
        lawyers: adminsResponse.data,
      };
    } catch (error) {
      handleFormError(error, 'Erro ao carregar dados.');
      return { offices: [], lawyers: [] };
    }
  }, []);

  const loadFromLocalStorage = useCallback(
    async (initialData: { offices: any[]; lawyers: any[] }) => {
      const data = localStorage.getItem('WORK/Four');
      if (!data) return null;

      const parsedData = JSON.parse(data);
      const result: any = { formData: {}, officesSelected: [], selectedLawyers: [] };

      if (parsedData.physical_lawyer_type) {
        setIsLegalPerson(parsedData.physical_lawyer_type === 'legal');
      }

      if (parsedData.office_ids) {
        result.officesSelected = initialData.offices.filter(office =>
          parsedData.office_ids.includes(office.id),
        );
      }

      if (parsedData.profile_admin_ids) {
        setSelectedLawyers(parsedData.profile_admin_ids);
      }

      const formFields: (keyof FormData)[] = [
        'initial_atendee',
        'intern',
        'bachelor',
        'partner_lawyer',
        'responsible_lawyer',
        'physical_lawyer',
        'physical_lawyer_type',
      ];

      formFields.forEach(field => {
        if (parsedData[field]) {
          result.formData[field] = String(parsedData[field]);
        }
      });

      return result;
    },
    [],
  );

  const loadFromWorkForm = useCallback(
    (initialData: { offices: any[]; lawyers: any[] }) => {
      const source = workForm.data?.attributes || workForm.draftWork?.attributes;
      if (!source) return null;

      const result: any = { formData: {}, officesSelected: [], selectedLawyers: [] };

      if (source.offices) {
        const sourceOfficeIds = source.offices.map((office: any) => office.id.toString());

        result.officesSelected = initialData.offices.filter(office =>
          sourceOfficeIds.includes(office.id),
        );

        setIsLegalPerson(true);
      }

      if (source.profile_admins) {
        result.selectedLawyers = source.profile_admins.map((admin: any) => admin.id);
      }

      const formFields: (keyof FormData)[] = [
        'initial_atendee',
        'intern',
        'bachelor',
        'partner_lawyer',
        'responsible_lawyer',
        'physical_lawyer',
        'physical_lawyer_type',
      ];

      formFields.forEach(field => {
        if (source[field]) {
          result.formData[field] = String(source[field]);
        }
      });

      return result;
    },
    [workForm],
  );

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      try {
        const initialData = await loadInitialData();
        setOffices(initialData.offices);
        setAllLawyers(initialData.lawyers);

        let loadedData = await loadFromLocalStorage(initialData);

        if (!loadedData) {
          loadedData = loadFromWorkForm(initialData);
        }

        if (loadedData) {
          if (loadedData.officesSelected.length > 0) {
            setOfficesSelected(loadedData.officesSelected);
            setIsLegalPerson(true);
          }

          if (loadedData.selectedLawyers.length > 0) {
            setSelectedLawyers(loadedData.selectedLawyers);
          }

          setFormData(prev => ({
            ...prev,
            ...loadedData.formData,
          }));
        }
      } catch (error) {
        handleFormError(error, 'Erro ao inicializar dados.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [loadInitialData, loadFromLocalStorage, loadFromWorkForm, router.pathname]);

  useEffect(() => {
    if (isLegalPerson) {
      setSelectedLawyers([]);
    } else {
      setOfficesSelected([]);
    }
    setLegalPersonError(false);
  }, [isLegalPerson]);

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  return (
    <>
      <Notification
        open={openSnackbar}
        message={message}
        severity={type}
        onClose={() => setOpenSnackbar(false)}
      />

      <Container loading={loading}>
        {loading && (
          <LoadingOverlay>
            <CircularProgress size={30} style={{ color: '#01013D' }} />
          </LoadingOverlay>
        )}
        <Box mr={'16px'}>
          <LawyerRadioGroup isLegalPerson={isLegalPerson} setIsLegalPerson={setIsLegalPerson} />

          {isLegalPerson ? (
            <OfficeSelection
              offices={offices}
              officesSelected={officesSelected}
              handleSelectedOffice={handleSelectedOffice}
              legalPersonError={legalPersonError}
            />
          ) : (
            <LawyerSelect
              title="Advogado Pessoa Física"
              tooltip="Selecione quando a atuação for pela pessoa física."
              value={selectedLawyers[0] || null}
              options={allLawyers}
              onChange={value => setSelectedLawyers(value ? [value.id] : [])}
              error={legalPersonError}
            />
          )}

          <LawyerSelect
            title="Advogado Responsável"
            tooltip="Advogado responsável internamente pelas movimentações..."
            value={formData.responsible_lawyer}
            options={lawyers}
            onChange={value => handleSelectChange('responsible_lawyer', value)}
            placeholder="Selecione um Advogado Responsável"
          />

          <LawyerSelect
            title="Atendimento Inicial"
            tooltip="Responsável pelo primeiro atendimento do cliente."
            value={formData.initial_atendee}
            options={allLawyers}
            onChange={value => handleSelectChange('initial_atendee', value)}
            placeholder="Informe o Responsável"
          />

          <LawyerSelect
            title="Estagiários da Procuração"
            tooltip="Em alguns serviços administrativos, é possível adicionar os estagiários para executar trabalhos mais simples."
            value={formData.intern}
            options={trainees}
            onChange={value => handleSelectChange('intern', value)}
            placeholder="Selecione um Estagiário"
          />

          <LawyerSelect
            title="Bacharéis/Paralegais da Procuração"
            tooltip="Em alguns serviços administrativos, é possível adicionar os bacharéis/paralegais para executar trabalhos mais simples."
            value={formData.bachelor}
            options={paralegals}
            onChange={value => handleSelectChange('bachelor', value)}
            placeholder="Selecione um Paralegal"
          />

          {formData.partner_lawyer && (
            <LawyerSelect
              title="Sócio Responsável"
              tooltip="Sócio responsável pelo caso."
              value={formData.partner_lawyer}
              options={lawyers}
              onChange={value => handleSelectChange('partner_lawyer', value)}
            />
          )}

          {formData.physical_lawyer && (
            <LawyerSelect
              title="Advogado Físico"
              tooltip="Advogado que irá assinar fisicamente os documentos."
              value={formData.physical_lawyer}
              options={lawyers}
              onChange={value => handleSelectChange('physical_lawyer', value)}
            />
          )}
        </Box>

        {isLegalPerson && officesSelected.length > 0 && (
          <Box mt={'16px'}>
            <Typography
              display={'flex'}
              alignItems={'center'}
              variant="h6"
              style={{
                color: legalPersonError ? '#FF0000' : 'black',
                height: '40px',
              }}
            >
              {'Advogados'}
            </Typography>
            <Box width={'398px'} className="tableContainer">
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>
                        <Typography variant="subtitle1" style={{ height: '30px' }}>
                          {officesSelected.length > 0
                            ? 'Informe os Advogados'
                            : 'Nenhum Escritório selecionado'}
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={3} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {officesSelected.map(data => (
                      <LawyerSubTable
                        key={data.id}
                        row={data}
                        openSubTable={openSubTable}
                        setOpenSubTable={setOpenSubTable}
                        selectedLawyers={selectedLawyers}
                        setSelectedLawyers={setSelectedLawyers}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
});

export default WorkStepFour;
