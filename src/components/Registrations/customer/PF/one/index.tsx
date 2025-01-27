import React, {
  useContext,
  useState,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
} from 'react';

import {
  TextField,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Autocomplete,
  Button,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';

import { Container } from '../styles';
import {
  gendersOptions,
  civilStatusOptions,
  nationalityOptions,
  capacityOptions,
} from '@/utils/constants';

import { z, ZodError } from 'zod';
import { DescriptionText, colors } from '@/styles/globals';
import { Notification } from '@/components';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import { cpfMask } from '@/utils/masks';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getAllProfileCustomer } from '@/services/customers';
import CustomTooltip from '@/components/Tooltip';
import { MdOutlineAddCircle, MdOutlineInfo } from 'react-icons/md';
import RepresentativeModal from '../../representative/representativeModal';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { isDateBeforeToday, isValidCPF, isValidRG } from '@/utils/validator';
import { DatePicker } from '@mui/x-date-pickers';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import CustomDateField from '@/components/FormInputFields/CustomDateField';
import CustomSelectField from '@/components/FormInputFields/CustomSelectField';

export interface IRefPFCustomerStepOneProps {
  handleSubmitForm: () => void;
}

interface IStepOneProps {
  nextStep: () => void;
  editMode: boolean;
}

interface FormData {
  name: string;
  last_name: string;
  cpf: string;
  rg: string;
  birth: string;
  nationality: string;
  gender: string;
  civil_status: string;
  capacity: string;
  representor: any;
}

const stepOneSchema = z.object({
  name: z.string().min(1, { message: 'Nome é um campo obrigatório.' }),
  last_name: z.string().min(1, { message: 'Sobrenome é um campo obrigatório.' }),
  cpf: z
    .string()
    .min(11, { message: 'O CPF precisa ter no mínimo 11 dígitos.' })
    .refine(isValidCPF, { message: 'O CPF informado é inválido.' }),
  rg: z
    .string()
    .min(6, { message: 'O RG precisa ter no mínimo 6 dígitos.' })
    .refine(isValidRG, { message: 'O RG informado é inválido.' }),
  birth: z
    .string()
    .min(1, { message: 'Data de Nascimento é um campo obrigatório.' })
    .refine(isDateBeforeToday, {
      message: 'Data de nascimento inválida.',
    }),
  nationality: z.string().min(2, { message: 'Naturalidade é um campo obrigatório.' }),
  gender: z.string().min(2, { message: 'Sexo é um campo obrigatório.' }),
  civil_status: z.string().min(2, { message: 'Estado civil é um campo obrigatório.' }),
  capacity: z.string().min(2, { message: 'Capacidade é um campo obrigatório.' }),
});

const PFCustomerStepOne: ForwardRefRenderFunction<IRefPFCustomerStepOneProps, IStepOneProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [isModalRegisterRepresentativeOpen, setIsModalRegisterRepresentativeOpen] = useState(false);

  const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({});
  const { setPageTitle } = useContext(PageTitleContext);
  const { customerForm, setCustomerForm, setNewCustomerForm } = useContext(CustomerContext);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const today = new Date().toISOString().split('T')[0];
  const [representorsList, setRepresentorsList] = useState([] as any);
  const [formData, setFormData] = useState<FormData>({
    name: customerForm.name || '',
    last_name: customerForm.last_name || '',
    cpf: customerForm.cpf || '',
    rg: customerForm.rg || '',
    birth: customerForm.birth || '',
    nationality: customerForm.nationality || '',
    gender: customerForm.gender || '',
    civil_status: customerForm.civil_status || '',
    capacity: customerForm.capacity || '',
    representor: {},
  });

  const getRepresentors = async () => {
    const allCustomers = await getAllProfileCustomer('');
    const response = allCustomers.data;

    const representors = response.filter(
      (customer: any) => customer.attributes.customer_type === 'representative',
    );

    setRepresentorsList(representors);
  };

  useEffect(() => {
    getRepresentors();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cpf') {
      setFormData(prevData => ({
        ...prevData,
        cpf: cpfMask(value),
      }));
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PF/One');

    if (data) {
      const parsedData = JSON.parse(data);
      setFormData({
        name: parsedData.name,
        last_name: parsedData.last_name,
        cpf: cpfMask(parsedData.cpf),
        rg: parsedData.rg,
        birth: parsedData.birth,
        nationality: parsedData.nationality,
        gender: parsedData.gender,
        civil_status: parsedData.civil_status,
        capacity: parsedData.capacity,
        representor: parsedData.representor,
      });
    }
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('PF/One', JSON.stringify(data));
  };

  const handleSelectChange = (event: SelectChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRepresentorChange = (field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [field as string]: value,
    }));
  };

  const handleSubmitForm = () => {
    try {
      stepOneSchema.parse(formData);

      if (
        (!formData.representor?.id && formData.capacity === 'relatively') ||
        (!formData.representor?.id && formData.capacity === 'unable')
      ) {
        setMessage('Selecione um representante.');
        setType('error');
        setOpenSnackbar(true);
        return;
      }

      const dateNow = new Date().toISOString().split('T')[0];
      const dateNowFormatted = dateNow.split('-').reverse().join('/');

      const dateParts = formData.birth ? formData.birth.split('/') : dateNowFormatted.split('/');
      const day = dateParts[0];
      const month = dateParts[1];
      const year = dateParts[2];
      const birthDate = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];

      saveDataLocalStorage({
        name: formData.name,
        last_name: formData.last_name,
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: formData.rg,
        birth: birthDate,
        nationality: formData.nationality,
        gender: formData.gender,
        civil_status: formData.civil_status,
        capacity: formData.capacity,
        representor: formData.representor,
      });

      if (editMode) {
        customerForm.data.attributes.name = formData.name;
        customerForm.data.attributes.last_name = formData.last_name;
        customerForm.data.attributes.cpf = formData.cpf.replace(/\D/g, '');
        customerForm.data.attributes.rg = formData.rg;
        customerForm.data.attributes.birth = birthDate;
        customerForm.data.attributes.gender = formData.gender;
        customerForm.data.attributes.nationality = formData.nationality;
        customerForm.data.attributes.civil_status = formData.civil_status;
        customerForm.data.attributes.capacity = formData.capacity;
        customerForm.data.attributes.represent_attributes = {
          id: customerForm.data.attributes.represent?.id,
          representor_id: formData.representor?.id,
        };

        setCustomerForm(customerForm);

        setNewCustomerForm({
          name: formData.name,
          last_name: formData.last_name,
          cpf: formData.cpf.replace(/\D/g, ''),
          rg: formData.rg,
          birth: birthDate,
          gender: formData.gender,
          nationality: formData.nationality,
          civil_status: formData.civil_status,
          capacity: formData.capacity,
          represent_attributes: {
            id: customerForm.data.attributes.represent?.id,
            representor_id: formData.representor?.id,
          },
        });

        const representName = representorsList.find(
          (customer: any) => customer.id == formData.representor?.id,
        )?.attributes.name;

        const customerTitle = `${editMode ? 'Alterar' : 'Cadastro'} Pessoa Física ${
          customerForm.data.attributes.capacity === 'relatively'
            ? ' - Relativamente Incapaz'
            : customerForm.data.attributes.capacity === 'unable'
            ? ' - Absolutamente Incapaz'
            : ''
        } ${
          customerForm.data.attributes.represent_attributes?.representor_id
            ? ` - ${representName}`
            : ''
        }`;

        setPageTitle(customerTitle);

        nextStep();
        return;
      }

      if (formData) {
        customerForm.name = formData.name.trim();
        customerForm.last_name = formData.last_name.trim();
        customerForm.cpf = formData.cpf.replace(/\D/g, '');
        customerForm.rg = formData.rg;
        customerForm.birth = birthDate;
        customerForm.gender = formData.gender;
        customerForm.nationality = formData.nationality;
        customerForm.civil_status = formData.civil_status;
        customerForm.capacity = formData.capacity;
        customerForm.represent_attributes = {
          representor_id: formData.representor.id,
        };
      }

      setCustomerForm(customerForm);

      const representName = representorsList.find(
        (customer: any) => customer.id == formData.representor?.id,
      )?.attributes.name;

      const customerTitle = `${editMode ? 'Alterar' : 'Cadastro'} Pessoa Física ${
        customerForm.capacity === 'relatively'
          ? ' - Relativamente Incapaz'
          : customerForm.capacity === 'unable'
          ? ' - Absolutamente Incapaz'
          : ''
      } ${customerForm.represent_attributes?.representor_id ? ` - ${representName}` : ''}`;

      setPageTitle(customerTitle);

      nextStep();
    } catch (error: any) {
      handleFormError(error);
      scroll.scrollToTop({
        duration: 500,
        smooth: 'easeInOutQuart',
      });
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  const handleFormError = (error: any) => {
    setMessage('Corrija os erros no formulário.');
    setType('error');
    setOpenSnackbar(true);

    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const newErrors: { [key in keyof FormData]?: string } = {};

      for (const field in fieldErrors) {
        if (fieldErrors[field]) {
          newErrors[field as keyof FormData] = fieldErrors[field]?.[0]; // Getting only the first error messsage
        }
      }
      setErrors(newErrors);
    }
  };

  const customTitleWithInfo = (title: string, tooltipText: string) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Typography display={'flex'} alignItems={'center'} variant="h6" style={{ height: '40px' }}>
        {title}
      </Typography>
      <CustomTooltip title={tooltipText} placement="right">
        <span style={{ display: 'flex' }}>
          <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
        </span>
      </CustomTooltip>
    </div>
  );

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        const representor = representorsList.find(
          (customer: any) => customer.id == attributes.represent?.representor_id,
        );
        setFormData(prevData => ({
          ...prevData,
          name: attributes.name,
          last_name: attributes.last_name,
          cpf: attributes.cpf ? cpfMask(attributes.cpf) : '',
          rg: attributes.rg ? attributes.rg : '',
          birth: attributes.birth,
          nationality: attributes.nationality,
          gender: attributes.gender,
          civil_status: attributes.civil_status,
          capacity: attributes.capacity,
          representor: representor,
        }));

        customerForm.represent = attributes.represent;
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm, representorsList]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, [representorsList]);

  useEffect(() => {
    if (formData.capacity === 'relatively' || formData.capacity === 'unable') {
      setFormData(prevData => ({
        ...prevData,
        representor: {},
      }));
    }
  }, [formData.capacity]);

  useEffect(() => {
    setPageTitle(`${editMode ? 'Alterar' : 'Cadastro'} Pessoa Física`);
  }, [editMode, setPageTitle]);

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

      {isModalRegisterRepresentativeOpen && (
        <RepresentativeModal
          pageTitle="Cadastro de Representante"
          isOpen={isModalRegisterRepresentativeOpen}
          handleClose={() => setIsModalRegisterRepresentativeOpen(false)}
          handleRegistrationFinished={getRepresentors}
        />
      )}

      <Container>
        <form>
          <Box maxWidth={'812px'} display={'flex'} flexDirection={'column'} gap={'16px'}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <CustomTextField
                formData={formData}
                label="Nome"
                name={'name'}
                length={99}
                errorMessage={errors.name}
                handleInputChange={handleInputChange}
              />

              <CustomTextField
                formData={formData}
                label="Sobrenome"
                name={'last_name'}
                length={99}
                errorMessage={errors.last_name}
                handleInputChange={handleInputChange}
              />
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <CustomTextField
                formData={formData}
                label="CPF"
                name={'cpf'}
                length={16}
                errorMessage={errors.cpf}
                handleInputChange={handleInputChange}
              />

              <CustomTextField
                formData={formData}
                label="RG"
                name={'rg'}
                length={25}
                errorMessage={errors.rg}
                handleInputChange={handleInputChange}
              />
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <CustomDateField
                formData={formData}
                label="Data de Nascimento"
                name="birth"
                errorMessage={errors.birth}
                handleInputChange={handleInputChange}
              />

              <CustomSelectField
                formData={formData}
                label="Naturalidade"
                name="nationality"
                options={nationalityOptions}
                errorMessage={errors.nationality}
                handleSelectChange={handleSelectChange}
              />
            </div>
          </Box>

          <Box display={'flex'} gap={4} mt={'24px'} maxWidth={'812px'}>
            <CustomSelectField
              formData={formData}
              label="Gênero"
              name={'gender'}
              options={gendersOptions}
              errorMessage={errors.gender}
              handleSelectChange={handleSelectChange}
            />

            <CustomSelectField
              formData={formData}
              label="Estado Civil"
              name="civil_status"
              options={civilStatusOptions}
              errorMessage={errors.civil_status}
              handleSelectChange={handleSelectChange}
            />

            <CustomSelectField
              formData={formData}
              label="Capacidade"
              name="capacity"
              options={capacityOptions}
              errorMessage={errors.capacity}
              handleSelectChange={handleSelectChange}
            />
          </Box>

          {(formData.capacity === 'relatively' || formData.capacity === 'unable') && (
            <div style={{ display: 'flex', gap: '24px', maxWidth: '812px', marginTop: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  width: '50%',
                }}
              >
                <div
                  className="inputContainer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  {customTitleWithInfo(
                    'Representante',
                    'Selecione quando necessário um Representante.',
                  )}

                  <Autocomplete
                    fullWidth
                    limitTags={1}
                    id="multiple-limit-tags"
                    value={
                      representorsList.find(
                        (customer: any) => customer.id == formData.representor?.id,
                      ) || null
                    }
                    options={representorsList}
                    getOptionLabel={(option: any) => {
                      const name = option?.attributes?.name ?? '';
                      const lastName = option?.attributes?.last_name ?? '';
                      const fullName = `${name} ${lastName}`.trim();

                      const maxLength = 35;
                      return fullName.length > maxLength
                        ? fullName.slice(0, maxLength) + '...'
                        : fullName;
                    }}
                    onChange={(event, value) => handleRepresentorChange('representor', value)}
                    renderInput={params => (
                      <TextField
                        error={!formData.representor?.id}
                        {...params}
                        placeholder={'Informe o Representante'}
                        size="small"
                      />
                    )}
                    noOptionsText={`Nenhum Representante Encontrado`}
                  />
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsModalRegisterRepresentativeOpen(true)}
                  sx={{
                    backgroundColor: colors.quartiary,
                    color: colors.white,
                    width: '100%',
                    marginTop: 'auto',
                    '&:hover': {
                      backgroundColor: colors.quartiaryHover,
                    },
                  }}
                >
                  <DescriptionText style={{ cursor: 'pointer' }} className="ml-8">
                    {'Adicionar Representante'}
                  </DescriptionText>
                  <MdOutlineAddCircle size={20} />
                </Button>
              </div>
            </div>
          )}
        </form>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepOne);
