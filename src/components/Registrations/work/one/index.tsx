import {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
} from 'react';

import { z } from 'zod';
import { PageTitleContext } from '@/contexts/PageTitleContext';

import { WorkContext } from '@/contexts/WorkContext';
import { Notification } from '@/components';

import { IProfileCustomer } from '@/interfaces/ICustomer';
import { getAllProfileCustomer } from '@/services/customers';

import { Container } from './styles';

import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { getAllDraftWorks } from '@/services/works';
import { useSession } from 'next-auth/react';
import useLoadingCounter from '@/utils/useLoadingCounter';
import { getProfileCustomerFullName } from '@/utils/profileCustomerUtils';
import { CustomerSelection } from './CustomerSelection';
import { ProcessNumberInput } from './ProcessNumberInput';
import { DraftWorkSelection } from './DraftWorkSelection';
import { ProcedureSelection } from './ProcedureSelection';
import { SubjectSelection } from './SubjectSelection';

export interface IRefWorkStepOneProps {
  handleSubmitForm: () => void;
}

interface IStepOneProps {
  nextStep: () => void;
  setFormLoading: Dispatch<SetStateAction<boolean>>;
}

const stepOneSchema = z.object({
  profile_customer_ids: z.array(z.string()).min(1, { message: 'Selecione um cliente.' }),
  procedures: z.array(z.string()).min(1),
  subject: z.string().min(2),
});

const WorkStepOne: ForwardRefRenderFunction<IRefWorkStepOneProps, IStepOneProps> = (
  { nextStep, setFormLoading },
  ref,
) => {
  const { data: session } = useSession();
  const route = useRouter();
  const { workForm, setWorkForm, setUdateWorkForm } = useContext(WorkContext);
  const { setPageTitle } = useContext(PageTitleContext);
  const { setLoading } = useLoadingCounter(setFormLoading);

  const [formState, setFormState] = useState({
    selectedSubject: '',
    selectedArea: '',
    compensationsLastYears: '',
    officialCompensation: '',
    hasALawsuit: '',
    gainProjection: '',
    selectedFile: null as File[] | null,
    otherDescription: '',
  });

  const [isVisibleOptionsArea, setIsVisibleOptionsArea] = useState(false);
  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openFileSnackbar, setOpenFileSnackbar] = useState(false);

  const [customersList, setCustomersList] = useState<IProfileCustomer[]>([]);
  const [draftWorksList, setDraftWorksList] = useState<any[]>([]);
  const [processNumber, setProcessNumber] = useState<string>('');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [customerSelectedList, setCustomerSelectedList] = useState<IProfileCustomer[]>([]);
  const [selectedDraftWork, setSelectedDraftWork] = useState<any>(null);

  const handleCustomersSelected = (customers: any) => {
    const customerIds = customers.map((customer: any) => customer.id.toString());

    const customersData = customersList.filter((customer: any) =>
      customerIds.includes(customer.id),
    );

    setCustomerSelectedList(customersData);
  };

  const handleProcedureSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedProcedures(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value),
    );
  };

  const handleSubject = (value: string) => {
    const newValue = value === 'civil' ? 'civel' : value;
    setFormState(prev => ({ ...prev, selectedSubject: newValue }));
    setIsVisibleOptionsArea(!newValue.includes('min'));
  };

  const handleSelectArea = (value: string) => {
    setFormState(prev => ({ ...prev, selectedArea: value }));
  };

  const handleGainProjection = (value: number) => {
    const input = document.getElementById('gainProjection') as HTMLInputElement;
    if (value && input) {
      input.value = `R$ ${value}`;
    }
    setFormState(prev => ({
      ...prev,
      gainProjection: value ? value.toString() : '',
    }));
  };

  const handleSubmitForm = () => {
    try {
      stepOneSchema.parse({
        profile_customer_ids: customerSelectedList.map(customer => customer.id),
        procedures: selectedProcedures,
        subject: formState.selectedSubject,
      });

      let data: any = {
        profile_customer_ids: customerSelectedList.map(customer => customer.id),
        number: processNumber,
        procedures: selectedProcedures,
        subject: formState.selectedSubject,
        draftWork: selectedDraftWork,
      };

      switch (formState.selectedSubject) {
        case 'civel':
          data.civel_area = formState.selectedArea;
          break;
        case 'social_security':
          data.social_security_area = formState.selectedArea;
          break;
        case 'laborite':
          data.laborite_area = formState.selectedArea;
          break;
        case 'tributary':
          data.tributary_area = formState.selectedArea;
          break;
        case 'tributary_pis':
          Object.assign(data, {
            compensations_five_years: formState.compensationsLastYears,
            compensations_service: formState.officialCompensation,
            lawsuit: formState.hasALawsuit,
            gain_projection: formState.gainProjection,
            tributary_files: formState.selectedFile,
          });
          break;
        case 'others':
          data.other_description = formState.otherDescription;
          break;
      }

      if (route.pathname === '/alterar') {
        setUdateWorkForm(data);
        saveDataLocalStorage(data);
      } else {
        const mergedData = { ...workForm, ...data };
        saveDataLocalStorage(mergedData);
        setWorkForm(mergedData);
      }

      nextStep();
    } catch (err) {
      handleFormError(err);
    }
  };

  const handleFormError = (error: any) => {
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: { [key: string]: string } = {};
    setMessage('Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);
    for (const field in newErrors) {
      errorObject[field] = newErrors[field][0] as string;
    }
    setErrors(errorObject);
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/One', JSON.stringify(data));
  };

  const verifyDataLocalStorage = async () => {
    setLoading(true);
    const data = localStorage.getItem('WORK/One');
    if (data) {
      const parsed = JSON.parse(data);
      setSelectedDraftWork(parsed.draftWork ?? null);
      setProcessNumber(parsed.number ?? '');
      setSelectedProcedures(parsed.procedures ?? []);
      handleSubject(parsed.subject ?? '');

      setFormState(prev => ({
        ...prev,
        selectedSubject: parsed.subject ?? '',
        selectedArea: parsed[`${parsed.subject}_area`] ?? '',
        compensationsLastYears: parsed.compensations_five_years ?? '',
        officialCompensation: parsed.compensations_service ?? '',
        hasALawsuit: parsed.lawsuit ?? '',
        gainProjection: parsed.gain_projection ?? undefined,
        selectedFile: parsed.tributary_files ?? null,
        otherDescription: parsed.other_description ?? '',
      }));

      if (parsed.profile_customer_ids && customersList.length > 0) {
        const selectedCustomers = customersList.filter(customer =>
          parsed.profile_customer_ids.includes(customer.id.toString()),
        );
        setCustomerSelectedList(selectedCustomers);
      }
    }
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    if (route.pathname === '/cadastrar') {
      setWorkForm({});
    }
    setPageTitle(`${route.asPath.includes('cadastrar') ? 'Cadastrar' : 'Alterar'} Trabalho`);
  }, [route, setPageTitle, setWorkForm]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [customersResp, draftsResp] = await Promise.all([
        getAllProfileCustomer(''),
        getAllDraftWorks(),
      ]);
      if (customersResp) {
        const sorted = customersResp.data.sort((a: IProfileCustomer, b: IProfileCustomer) =>
          getProfileCustomerFullName(a).localeCompare(getProfileCustomerFullName(b), 'pt-BR'),
        );
        setCustomersList(sorted);
      }
      setDraftWorksList(draftsResp.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!workForm?.data?.attributes || customersList.length === 0) return;

    const attributes = workForm.data.attributes;
    setLoading(true);

    if (attributes.procedures) setSelectedProcedures(attributes.procedures);
    if (attributes.profile_customers?.length) {
      handleCustomersSelected(attributes.profile_customers);
    }

    setProcessNumber(attributes.number ?? '');
    handleSubject(attributes.subject ?? '');
    setFormState(prev => ({
      ...prev,
      selectedSubject: attributes.subject ?? '',
      selectedArea: attributes[`${attributes.subject}_area`] ?? '',
      compensationsLastYears: attributes.compensations_five_years,
      officialCompensation: attributes.compensations_service,
      hasALawsuit: attributes.lawsuit,
      gainProjection: attributes.gain_projection ?? '',
      selectedFile: attributes.tributary_files ?? null,
      otherDescription: attributes.other_description ?? '',
    }));

    setLoading(false);
  }, [workForm, customersList]);

  useEffect(() => {
    if (customersList.length > 0) {
      verifyDataLocalStorage();
    }
  }, [customersList]);

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={type}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      <Container>
        <Box sx={{ width: '100%' }}>
          <CustomerSelection
            customersList={customersList}
            customerSelectedList={customerSelectedList}
            handleCustomersSelected={handleCustomersSelected}
            error={errors.profile_customer_ids}
          />

          <ProcessNumberInput
            processNumber={processNumber}
            setProcessNumber={setProcessNumber}
            error={errors.number}
          />

          <DraftWorkSelection
            draftWorksList={draftWorksList}
            selectedDraftWork={selectedDraftWork}
            setSelectedDraftWork={setSelectedDraftWork}
            disabled={route.pathname === '/alterar'}
          />

          <ProcedureSelection
            selectedProcedures={selectedProcedures}
            handleProcedureSelection={handleProcedureSelection}
            errors={errors}
          />

          <SubjectSelection
            role={session?.role || ''}
            selectedSubject={formState.selectedSubject}
            errors={errors}
            handleSubject={handleSubject}
            isVisibleOptionsArea={isVisibleOptionsArea}
            selectedArea={formState.selectedArea}
            handleSelectArea={handleSelectArea}
            compensationsLastYears={formState.compensationsLastYears}
            setCompensationsLastYears={(value: string) =>
              setFormState(prev => ({ ...prev, compensationsLastYears: value }))
            }
            officialCompensation={formState.officialCompensation}
            setOfficialCompensation={(value: string) =>
              setFormState(prev => ({ ...prev, officialCompensation: value }))
            }
            hasALawsuit={formState.hasALawsuit}
            setHasALawsuit={(value: string) =>
              setFormState(prev => ({ ...prev, hasALawsuit: value }))
            }
            gainProjection={formState.gainProjection}
            handleGainProjection={(value: string | null) =>
              handleGainProjection(value ? Number(value) : 0)
            }
            selectedFile={formState.selectedFile}
            setSelectedFile={files => {
              if (typeof files === 'function') {
                setFormState(prev => ({
                  ...prev,
                  selectedFile: files(prev.selectedFile),
                }));
              } else {
                setFormState(prev => ({
                  ...prev,
                  selectedFile: files,
                }));
              }
            }}
            openFileSnackbar={openFileSnackbar}
            setOpenFileSnackbar={setOpenFileSnackbar}
            otherDescription={formState.otherDescription}
            setOtherDescription={(description?: string) =>
              setFormState(prev => ({ ...prev, otherDescription: description || '' }))
            }
          />
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(WorkStepOne);
