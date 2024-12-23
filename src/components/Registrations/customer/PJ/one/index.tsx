import React, {
  useContext,
  useState,
  useEffect,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { Box, Typography } from '@mui/material';
import { getCEPDetails } from '@/services/brasilAPI';

import { Container } from '../styles';

import { z, ZodError } from 'zod';
import { Divider } from '@/styles/globals';
import { Notification } from '@/components';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { cepMask, cnpjMask } from '@/utils/masks';
import { useRouter } from 'next/router';
import { isValidCEP, isValidCNPJ } from '@/utils/validator';
import CustomTextField from '@/components/FormInputFields/CustomTextField';

export interface IRefPJCustomerStepOneProps {
  handleSubmitForm: () => void;
}

interface IStepOneProps {
  nextStep: () => void;
  editMode: boolean;
}

interface FormData {
  name: string;
  cnpj: string;
  zip_code: string;
  gender: string;
  street: string;
  state: string;
  city: string;
  number: string;
  description: string;
  neighborhood: string;
}

const stepOneSchema = z.object({
  name: z.string().min(1, { message: 'Nome é um campo obrigatório.' }),
  cnpj: z
    .string()
    .min(2, { message: 'CNPJ é um campo obrigatório.' })
    .refine(isValidCNPJ, { message: 'O CNPJ informado é inválido.' }),
  zip_code: z
    .string()
    .min(8, { message: 'O CEP precisa ter no mínimo 8 dígitos.' })
    .refine(isValidCEP, { message: 'O CEP informado é inválido.' }),
  street: z.string().min(2, { message: 'Endereço é um campo obrigatório.' }),
  number: z.coerce.string().min(2, { message: 'Número é um campo obrigatório' }),
  neighborhood: z.string().min(2, { message: 'Bairro é um campo obrigatório.' }),
});

const PJCustomerStepOne: ForwardRefRenderFunction<IRefPJCustomerStepOneProps, IStepOneProps> = (
  { nextStep, editMode },
  ref,
) => {
  const route = useRouter();
  const [errors, setErrors] = useState({} as any);
  const { customerForm, setCustomerForm, setNewCustomerForm } = useContext(CustomerContext);
  const { setPageTitle } = useContext(PageTitleContext);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState<FormData>({} as FormData);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cnpj') {
      // Apply cnpjMask to format the CNPJ value
      setFormData(prevData => ({
        ...prevData,
        [name]: cnpjMask(value),
      }));
      return;
    }

    if (errors[name]) {
      delete errors[name];
      setErrors(errors);
    }

    if (name === 'zip_code') {
      setFormData(prevData => ({
        ...prevData,
        [name]: cepMask(value),
      }));
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitForm = () => {
    try {
      stepOneSchema.parse({
        name: formData.name || '',
        cnpj: formData.cnpj || '',
        street: formData.street || '',
        zip_code: formData.zip_code || '',
        neighborhood: formData.neighborhood || '',
        number: formData.number || '',
      });

      const data = {
        name: formData.name,
        cnpj: formData.cnpj ? formData.cnpj.replace(/\D/g, '') : '',
        gender: 'male',
        capacity: 'able',
        civil_status: 'single',
        cpf: '00000000000',
        rg: '000000000',
        nationality: 'brazilian',
        profession: 'company',
        addresses_attributes: [
          {
            zip_code: formData.zip_code,
            street: formData.street,
            state: formData.state,
            city: formData.city,
            number: formData.number,
            description: formData.description,
            neighborhood: formData.neighborhood,
          },
        ],
      };

      saveDataLocalStorage(data);

      if (editMode) {
        customerForm.data.attributes.name = formData.name;
        customerForm.data.attributes.cnpj = formData.cnpj ? formData.cnpj : '';
        customerForm.data.attributes.gender = formData.gender;
        customerForm.data.attributes.capacity = 'able';
        customerForm.data.attributes.civil_status = 'single';
        customerForm.data.attributes.cpf = '00000000000';
        customerForm.data.attributes.rg = '000000000';
        customerForm.data.attributes.nationality = 'brazilian';
        customerForm.data.attributes.profession = 'company';

        customerForm.data.attributes.addresses_attributes = [
          {
            id: customerForm?.data?.attributes?.addresses[0]?.id,
            zip_code: formData.zip_code,
            street: formData.street,
            state: formData.state,
            city: formData.city,
            number: formData.number,
            description: formData.description,
            neighborhood: formData.neighborhood,
          },
        ];

        setCustomerForm(customerForm);

        setNewCustomerForm({
          name: formData.name,
          cnpj: formData.cnpj ? formData.cnpj : '',
          gender: formData.gender,
          capacity: 'able',
          civil_status: 'single',
          cpf: '00000000000',
          rg: '000000000',
          nationality: 'brazilian',
          profession: 'company',
          addresses_attributes: [
            {
              id: customerForm?.data?.attributes?.addresses[0]?.id,
              zip_code: formData.zip_code,
              street: formData.street,
              state: formData.state,
              city: formData.city,
              number: formData.number,
              description: formData.description,
              neighborhood: formData.neighborhood,
            },
          ],
        });

        nextStep();
        return;
      }

      setCustomerForm(data);
      nextStep();
    } catch (error: any) {
      handleFormError(error);
      scroll.scrollToTop({
        duration: 500,
        smooth: 'easeInOutQuart',
      });
    }
  };

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PJ/One');

    if (data) {
      const parsedData = JSON.parse(data);
      const address = parsedData.addresses_attributes[0];

      let localStorageData: any = {
        cnpj: parsedData.cnpj || '',
        name: parsedData.name || '',
        gender: parsedData.gender,
      };

      if (address) {
        localStorageData = {
          ...localStorageData,
          street: address.street,
          state: address.state,
          city: address.city,
          number: address.number as number,
          description: address.description,
          neighborhood: address.neighborhood,
          zip_code: address.zip_code,
        };
      }

      setFormData(prevData => ({
        ...prevData,
        ...localStorageData,
      }));
    }
  };

  useEffect(() => {
    verifyDataLocalStorage();
  }, []);

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('PJ/One', JSON.stringify(data));
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

  useEffect(() => {
    const fetchCEPDetails = async () => {
      const numericCEP = formData.zip_code.replace(/\D/g, '');

      if (numericCEP.length === 8) {
        try {
          const response = await getCEPDetails(numericCEP);
          setFormData(prevData => ({
            ...prevData,
            state: response.state || prevData.state,
            city: response.city || prevData.city,
            street: response.street || prevData.street,
            neighborhood: response.neighborhood || prevData.neighborhood,
          }));
        } catch (error: any) {
          setMessage('CEP inválido.');
          setType('error');
          setOpenSnackbar(true);
        }
      }
    };

    if (formData.zip_code) {
      fetchCEPDetails();
    }
  }, [formData.zip_code]);

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        setFormData(prevData => ({
          ...prevData,
          name: attributes.name,
          cnpj: attributes.cnpj ? attributes.cnpj : '',
          gender: attributes.gender,
        }));

        if (customerForm.data.attributes.addresses.length > 0) {
          const lastAddress =
            customerForm.data.attributes.addresses[
              customerForm.data.attributes.addresses.length - 1
            ];

          setFormData(prevData => ({
            ...prevData,
            zip_code: lastAddress.zip_code,
            street: lastAddress.street,
            state: lastAddress.state,
            city: lastAddress.city,
            number: lastAddress.number,
            description: lastAddress.description,
            neighborhood: lastAddress.neighborhood,
          }));
        }
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm]);

  useEffect(() => {
    setPageTitle(`${route.asPath.includes('cadastrar') ? 'Cadastro' : 'Alterar'} Pessoa Jurídica`);
  }, [route, setPageTitle]);

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
          <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
            <div style={{ display: 'flex', gap: '32px' }}>
              <Box width={'210px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Descrição da Empresa'}
                </Typography>
              </Box>
              <CustomTextField
                formData={formData}
                name="name"
                label="Nome"
                errorMessage={errors.name}
                handleInputChange={handleInputChange}
              />

              <CustomTextField
                formData={formData}
                name="cnpj"
                label="Número do CNPJ"
                placeholder="00.000.000/000-00"
                errorMessage={errors.cnpj}
                handleInputChange={handleInputChange}
              />
            </div>

            <Divider />

            <div style={{ display: 'flex', gap: '32px' }}>
              <Box width={'210px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Endereço'}
                </Typography>
              </Box>

              <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                <CustomTextField
                  formData={formData}
                  name="zip_code"
                  label="CEP"
                  errorMessage={errors.zip_code}
                  handleInputChange={handleInputChange}
                />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <CustomTextField
                    formData={formData}
                    name="street"
                    label="Endereço"
                    errorMessage={errors.street}
                    handleInputChange={handleInputChange}
                  />
                  <Box maxWidth={'30%'}>
                    <CustomTextField
                      formData={formData}
                      name="number"
                      label="Número"
                      placeholder="N.º"
                      errorMessage={errors.number}
                      handleInputChange={handleInputChange}
                    />
                  </Box>
                </div>
                <CustomTextField
                  formData={formData}
                  name="description"
                  label="Complemento"
                  errorMessage={errors.description}
                  handleInputChange={handleInputChange}
                />
              </Box>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                <CustomTextField
                  formData={formData}
                  name="neighborhood"
                  label="Bairro"
                  errorMessage={errors.neighborhood}
                  handleInputChange={handleInputChange}
                />

                <CustomTextField
                  formData={formData}
                  name="city"
                  label="Cidade"
                  errorMessage={errors.city}
                  handleInputChange={handleInputChange}
                />

                <CustomTextField
                  formData={formData}
                  name="state"
                  label="Estado"
                  errorMessage={errors.state}
                  handleInputChange={handleInputChange}
                />
              </Box>
            </div>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default forwardRef(PJCustomerStepOne);
