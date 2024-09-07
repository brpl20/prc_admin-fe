import React, {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
} from 'react';

import { Container } from '../styles';
import { CustomerContext } from '@/contexts/CustomerContext';

import { Box, TextField, Typography } from '@mui/material';
import { Notification } from '@/components';
import { z } from 'zod';
import { set } from 'date-fns';

export interface IRefPFCustomerStepFiveProps {
  handleSubmitForm: () => void;
}
interface IStepFiveProps {
  nextStep: () => void;
  editMode: boolean;
}

interface FormData {
  profession: string;
  company: string;
  number_benefit: string;
  nit: string;
  mother_name: string;
  inss_password: string;
}

const stepFiveSchema = z.object({
  profession: z.string().min(3, 'Profissão é obrigatório'),
  company: z.string(),
  number_benefit: z.string(),
  mother_name: z.string().min(3, 'Nome da Mãe é obrigatório'),
});

const PFCustomerStepFive: ForwardRefRenderFunction<IRefPFCustomerStepFiveProps, IStepFiveProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext(CustomerContext);
  const [formData, setFormData] = useState<FormData>({
    profession: '',
    company: '',
    number_benefit: '',
    nit: '',
    mother_name: '',
    inss_password: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PF/Five');

    if (data) {
      const parsedData = JSON.parse(data);
      setFormData({
        profession: parsedData.profession,
        company: parsedData.company,
        number_benefit: parsedData.number_benefit,
        nit: parsedData.nit,
        mother_name: parsedData.mother_name,
        inss_password: parsedData.inss_password,
      });
    }
  };

  useEffect(() => {
    verifyDataLocalStorage();
  }, []);

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('PF/Five', JSON.stringify(data));
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

  const handleSubmitForm = () => {
    saveDataLocalStorage({
      ...customerForm,
      profession: formData.profession,
      company: formData.company,
      number_benefit: formData.number_benefit,
      nit: formData.nit,
      mother_name: formData.mother_name,
      inss_password: formData.inss_password,
    });

    try {
      stepFiveSchema.parse({
        profession: formData.profession,
        company: formData.company,
        number_benefit: formData.number_benefit,
        mother_name: formData.mother_name,
      });

      if (editMode) {
        customerForm.data.attributes.profession = formData.profession;
        customerForm.data.attributes.company = formData.company;
        customerForm.data.attributes.number_benefit = formData.number_benefit;
        customerForm.data.attributes.nit = formData.nit;
        customerForm.data.attributes.mother_name = formData.mother_name;
        customerForm.data.attributes.inss_password = formData.inss_password;

        setNewCustomerForm({
          ...newCustomerForm,
          profession: formData.profession,
          company: formData.company,
          number_benefit: formData.number_benefit,
          nit: formData.nit,
          mother_name: formData.mother_name,
          inss_password: formData.inss_password,
        });

        setCustomerForm(customerForm);
        nextStep();
        return;
      }

      const data = {
        ...customerForm,
        profession: formData.profession,
        company: formData.company,
        number_benefit: formData.number_benefit,
        nit: formData.nit,
        mother_name: formData.mother_name,
        inss_password: formData.inss_password,
      };

      setCustomerForm(data);
      nextStep();
    } catch (err) {
      handleFormError(err);
    }
  };

  const renderInputField = (
    label: string,
    name: keyof FormData,
    length: number,
    placeholderValue: string,
    error?: boolean,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {label}
      </Typography>
      <TextField
        id="outlined-basic"
        variant="outlined"
        inputProps={{ maxLength: length }}
        fullWidth
        name={name}
        size="small"
        sx={{ flex: 1 }}
        value={formData[name]}
        autoComplete="off"
        placeholder={`${placeholderValue}`}
        onChange={handleInputChange}
        error={error && !formData[name]}
      />
    </div>
  );

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        setFormData(prevData => ({
          ...prevData,
          phoneInputFields: attributes.profession,
          profession: attributes.profession,
          company: attributes.company,
          number_benefit: attributes.number_benefit,
          nit: attributes.nit,
          mother_name: attributes.mother_name,
          inss_password: attributes.inss_password,
        }));
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
        <Box maxWidth={'812px'} display={'flex'} flexDirection={'column'} gap={'16px'}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {renderInputField(
              'Profissão',
              'profession',
              99,
              'Informe a Profissão',
              !!errors.profession,
            )}
            {renderInputField(
              'Empresa Atual',
              'company',
              99,
              'Informe a Empersa Atual',
              !!errors.company,
            )}
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            {renderInputField(
              'Número de Benefício',
              'number_benefit',
              99,
              'Informe o Número de Benefício',
              !!errors.number_benefit,
            )}
            {renderInputField('NIT', 'nit', 30, 'Informe o Número do NIT')}
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            {renderInputField(
              'Nome da Mãe',
              'mother_name',
              99,
              'Informe o Nome',
              !!errors.mother_name,
            )}
            {renderInputField('Senha do meu INSS', 'inss_password', 99, 'Informe a Senha')}
          </div>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepFive);
