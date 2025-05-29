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
import { z, ZodError } from 'zod';
import { set } from 'date-fns';
import CustomTextField from '@/components/FormInputFields/CustomTextField';

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
  profession: z.string().min(3, 'Profissão é um campo obrigatório'),
  company: z.string().optional(),
  number_benefit: z.string().optional(),
  mother_name: z.string().min(3, 'Nome da Mãe é um campo obrigatório'),
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
            <CustomTextField
              formData={formData}
              name="profession"
              label="Profissão"
              placeholder="Informe a Profissão"
              errorMessage={errors.profession}
              handleInputChange={handleInputChange}
              required
            />
            <CustomTextField
              formData={formData}
              name="company"
              label="Empresa Atual"
              placeholder="Informe a Empresa Atual"
              errorMessage={errors.company}
              handleInputChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <CustomTextField
              formData={formData}
              name="number_benefit"
              label="Número de Benefício"
              placeholder="Informe o Número de Benefício"
              errorMessage={errors.number_benefit}
              handleInputChange={handleInputChange}
            />

            <CustomTextField
              formData={formData}
              name="nit"
              label="NIT"
              placeholder="Informe o NIT"
              length={30}
              errorMessage={errors.nit}
              handleInputChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <CustomTextField
              formData={formData}
              name="mother_name"
              label="Nome da Mãe"
              placeholder="Informe o Nome da Mãe"
              errorMessage={errors.mother_name}
              handleInputChange={handleInputChange}
              required
            />

            <CustomTextField
              formData={formData}
              name="inss_password"
              label="Senha do meu INSS"
              placeholder="Informe a Senha do meu INSS"
              errorMessage={errors.inss_password}
              handleInputChange={handleInputChange}
            />
          </div>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepFive);
