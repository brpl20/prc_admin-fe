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
} from '@mui/material';

import { Container, BirthdayContainer } from '../styles';
import {
  gendersOptions,
  civilStatusOptions,
  nationalityOptions,
  capacityOptions,
} from '@/utils/constants';

import { z } from 'zod';
import { Flex } from '@/styles/globals';
import Notification from '@/components/Notification';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { cpfMask, rgMask } from '@/utils/masks';

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
  const currentDate = dayjs();
  const [errors, setErrors] = useState({} as any);
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

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
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cpf') {
      setFormData(prevData => ({
        ...prevData,
        cpf: cpfMask(value),
      }));
      return;
    }

    if (name === 'rg') {
      setFormData(prevData => ({
        ...prevData,
        rg: rgMask(value),
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
        rg: rgMask(parsedData.rg),
        birth: parsedData.birth,
        nationality: parsedData.nationality,
        gender: parsedData.gender,
        civil_status: parsedData.civil_status,
        capacity: parsedData.capacity,
      });
    }
  };

  useEffect(() => {
    verifyDataLocalStorage();
  }, []);

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
        rg: formData.rg.replace(/\D/g, ''),
        birth: birthDate,
        nationality: formData.nationality,
        gender: formData.gender,
        civil_status: formData.civil_status,
        capacity: formData.capacity,
      });

      if (editMode) {
        customerForm.data.attributes.name = formData.name;
        customerForm.data.attributes.last_name = formData.last_name;
        customerForm.data.attributes.cpf = formData.cpf.replace(/\D/g, '');
        customerForm.data.attributes.rg = formData.rg.replace(/\D/g, '');
        customerForm.data.attributes.birth = birthDate;
        customerForm.data.attributes.gender = formData.gender;
        customerForm.data.attributes.nationality = formData.nationality;
        customerForm.data.attributes.civil_status = formData.civil_status;
        customerForm.data.attributes.capacity = formData.capacity;

        setCustomerForm(customerForm);

        nextStep();
        return;
      }

      if (formData) {
        customerForm.name = formData.name;
        customerForm.last_name = formData.last_name;
        customerForm.cpf = formData.cpf.replace(/\D/g, '');
        customerForm.rg = formData.rg.replace(/\D/g, '');
        customerForm.birth = birthDate;
        customerForm.gender = formData.gender;
        customerForm.nationality = formData.nationality;
        customerForm.civil_status = formData.civil_status;
        customerForm.capacity = formData.capacity;
      }

      setCustomerForm(customerForm);

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
    const newErrors = error.formErrors.fieldErrors;
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
        setFormData(prevData => ({
          ...prevData,
          name: attributes.name,
          last_name: attributes.last_name,
          cpf: attributes.cpf ? cpfMask(attributes.cpf) : '',
          rg: attributes.rg ? rgMask(attributes.rg) : '',
          birth: attributes.birth,
          nationality: attributes.nationality,
          gender: attributes.gender,
          civil_status: attributes.civil_status,
          capacity: attributes.capacity,
        }));

        setSelectedDate(dayjs(attributes.birth));
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm]);

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
        </form>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepOne);
