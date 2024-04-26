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
} from '@mui/material';

import { Container, BirthdayContainer } from '../styles';
import {
  gendersOptions,
  civilStatusOptions,
  nationalityOptions,
  capacityOptions,
} from '@/utils/constants';

import { z } from 'zod';
import { DescriptionText, Flex, colors } from '@/styles/globals';
import Notification from '@/components/Notification';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getAllCustomers } from '@/services/customers';
import CustomTooltip from '@/components/Tooltip';
import { MdOutlineAddCircle, MdOutlineInfo } from 'react-icons/md';
import RepresentativeModal from '../../representative/representativeModal';
import { PageTitleContext } from '@/contexts/PageTitleContext';

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
  name: z.string().nonempty(),
  last_name: z.string().nonempty(),
  cpf: z.string().nonempty('CPF obrigatório'),
  rg: z.string().nonempty('RG obrigatório'),
  birth: z.string().optional(),
  nationality: z.string().nonempty('Naturalidade obrigatória'),
  gender: z.string().nonempty('Sexo obrigatório'),
  civil_status: z.string().nonempty('Estado civil obrigatório'),
  capacity: z.string().nonempty('Capacidade obrigatória'),
});

const PFCustomerStepOne: ForwardRefRenderFunction<IRefPFCustomerStepOneProps, IStepOneProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [isModalRegisterRepresentativeOpen, setIsModalRegisterRepresentativeOpen] = useState(false);
  const [isRepresentativeFinished, setIsRepresentativeFinished] = useState(false);
  const currentDate = dayjs();
  const [errors, setErrors] = useState({} as any);
  const { setPageTitle } = useContext(PageTitleContext);
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [representorsList, setRepresentorsList] = useState([] as any);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [formData, setFormData] = useState<FormData>({
    name: customerForm.name,
    last_name: customerForm.last_name,
    cpf: customerForm.cpf,
    rg: customerForm.rg,
    birth: customerForm.birth,
    nationality: customerForm.nationality,
    gender: customerForm.gender,
    civil_status: customerForm.civil_status,
    capacity: customerForm.capacity,
    representor: {},
  });

  useEffect(() => {
    const getRepresentors = async () => {
      const allCustomers = await getAllCustomers();
      const response = allCustomers.data;

      const representors = response.filter(
        (customer: any) => customer.attributes.customer_type === 'representative',
      );

      setRepresentorsList(representors);
    };

    getRepresentors();
  }, [isRepresentativeFinished]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

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
        cpf: parsedData.cpf,
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

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const handleRepresentorChange = (field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [field as string]: value,
    }));
  };

  const handleBirthDate = (date: any) => {
    const birthDate = new Date(date).toLocaleDateString('pt-BR');
    setSelectedDate(date);
    setFormData((prevData: any) => ({
      ...prevData,
      ['birth']: birthDate,
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
        cpf: formData.cpf,
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
        customerForm.data.attributes.cpf = formData.cpf;
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
        customerForm.name = formData.name;
        customerForm.last_name = formData.last_name;
        customerForm.cpf = formData.cpf;
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
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: { [key: string]: string } = {};
    setMessage('Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);

    for (const field in newErrors) {
      if (Object.prototype.hasOwnProperty.call(newErrors, field)) {
        errorObject[field] = newErrors[field][0] as string;
      }
    }
    setErrors(errorObject);
  };

  const customTitleWithInfo = (title: string, tooltipText: string) => (
    <Flex style={{ alignItems: 'center' }}>
      <Typography display={'flex'} alignItems={'center'} variant="h6" style={{ height: '40px' }}>
        {title}
      </Typography>
      <CustomTooltip title={tooltipText} placement="right">
        <span style={{ display: 'flex' }}>
          <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
        </span>
      </CustomTooltip>
    </Flex>
  );

  const renderInputField = (label: string, name: keyof FormData, error: boolean) => (
    <Flex style={{ flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {label}
      </Typography>
      <TextField
        id="outlined-basic"
        variant="outlined"
        error={error && !formData[name]}
        fullWidth
        type="text"
        name={name}
        size="small"
        value={formData[name] || ''}
        autoComplete="off"
        placeholder={`Informe o ${label}`}
        onChange={handleInputChange}
      />
    </Flex>
  );

  const renderSelectField = (
    label: string,
    name: keyof FormData,
    options: { label: string; value: string }[],
    error?: boolean,
  ) => (
    <Flex style={{ flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {label}
      </Typography>
      <FormControl size="small">
        <InputLabel error={error && !formData[name]}>{`Selecione ${label}`}</InputLabel>
        <Select
          name={name}
          label={`Selecione ${label}`}
          value={formData[name] || ''}
          onChange={handleSelectChange}
        >
          {options.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Flex>
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
          cpf: attributes.cpf ? attributes.cpf : '',
          rg: attributes.rg ? attributes.rg : '',
          birth: attributes.birth,
          nationality: attributes.nationality,
          gender: attributes.gender,
          civil_status: attributes.civil_status,
          capacity: attributes.capacity,
          representor: representor,
        }));

        customerForm.represent = attributes.represent;
        setSelectedDate(dayjs(attributes.birth));
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
          handleRegistrationFinished={() => setIsRepresentativeFinished(true)}
        />
      )}

      <Container>
        <form>
          <Box maxWidth={'812px'} display={'flex'} flexDirection={'column'} gap={'16px'}>
            <Flex style={{ gap: '24px' }}>
              {renderInputField('Nome', 'name', !!errors.name)}
              {renderInputField('Sobrenome', 'last_name', !!errors.last_name)}
            </Flex>
            <Flex style={{ gap: '24px' }}>
              {renderInputField('CPF', 'cpf', !!errors.cpf)}
              {renderInputField('RG', 'rg', !!errors.rg)}
            </Flex>
            <Flex style={{ gap: '24px' }}>
              <BirthdayContainer>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Flex>
                    <Typography mb={'8px'} variant="h6">
                      {'Data de Nascimento'}
                    </Typography>
                  </Flex>
                  <DatePicker
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '40px',
                      },
                    }}
                    format="DD/MM/YYYY"
                    value={dayjs(selectedDate)}
                    onChange={handleBirthDate}
                  />
                </LocalizationProvider>
              </BirthdayContainer>
              {renderSelectField(
                'Naturalidade',
                'nationality',
                nationalityOptions,
                !!errors.nationality,
              )}
            </Flex>
          </Box>

          <Box display={'flex'} gap={4} mt={'24px'} maxWidth={'812px'}>
            {renderSelectField('Gênero', 'gender', gendersOptions, !!errors.gender)}
            {renderSelectField(
              'Estado Civil',
              'civil_status',
              civilStatusOptions,
              !!errors.civil_status,
            )}

            {renderSelectField('Capacidade', 'capacity', capacityOptions, !!errors.capacity)}
          </Box>

          {(formData.capacity === 'relatively' || formData.capacity === 'unable') && (
            <Flex style={{ gap: '24px', maxWidth: '812px', marginTop: '24px' }}>
              <Flex
                style={{
                  flexDirection: 'column',
                  gap: '24px',
                  width: '50%',
                }}
              >
                <Flex className="inputContainer" style={{ flexDirection: 'column', width: '100%' }}>
                  {customTitleWithInfo(
                    'Representante',
                    'Selecione quando necessário um Representante.',
                  )}

                  <Autocomplete
                    limitTags={1}
                    id="multiple-limit-tags"
                    value={
                      representorsList.find(
                        (customer: any) => customer.id == formData.representor?.id,
                      ) || null
                    }
                    options={representorsList}
                    getOptionLabel={(option: any) => option?.attributes?.name ?? ''}
                    onChange={(event, value) => handleRepresentorChange('representor', value)}
                    renderInput={params => (
                      <TextField {...params} placeholder={'Informe o Representante'} size="small" />
                    )}
                    noOptionsText={`Nenhum Representante Encontrado`}
                  />
                </Flex>
              </Flex>
              <Flex>
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
              </Flex>
            </Flex>
          )}
        </form>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepOne);
