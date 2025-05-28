import React, { useContext, useState, useEffect, forwardRef, useCallback, useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getCEPDetails } from '@/services/brasilAPI';
import { Container } from '../styles';
import { z } from 'zod';
import { Divider } from '@/styles/globals';
import { Notification } from '@/components';
import { animateScroll as scroll } from 'react-scroll';
import { cepMask, cnpjMask } from '@/utils/masks';
import { useRouter } from 'next/router';
import { isValidCEP, isValidCNPJ } from '@/utils/validator';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import { LoadingOverlay } from '@/components/Registrations/work/one/styles';
import { CustomerContext } from '@/contexts/CustomerContext';
import { PageTitleContext } from '@/contexts/PageTitleContext';

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
  [key: string]: unknown;
}

interface AddressAttributes {
  zip_code: string;
  street: string;
  state: string;
  city: string;
  number: string;
  description: string;
  neighborhood: string;
  id?: string;
}

interface CustomerData {
  name: string;
  cnpj: string;
  gender: string;
  capacity: string;
  civil_status: string;
  cpf: string;
  rg: string;
  nationality: string;
  profession: string;
  addresses_attributes: AddressAttributes[];
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

const PJCustomerStepOne = forwardRef<IRefPJCustomerStepOneProps, IStepOneProps>(
  ({ nextStep, editMode }, ref) => {
    const [loading, setLoading] = useState(false);
    const route = useRouter();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { customerForm, setCustomerForm, setNewCustomerForm } = useContext(CustomerContext);
    const { setPageTitle } = useContext(PageTitleContext);
    const [notification, setNotification] = useState({
      open: false,
      message: '',
      type: 'success' as 'success' | 'error',
    });

    const initialFormData: FormData = useMemo(
      () => ({
        name: '',
        cnpj: '',
        zip_code: '',
        gender: 'male',
        street: '',
        state: '',
        city: '',
        number: '',
        description: '',
        neighborhood: '',
      }),
      [],
    );

    const [formData, setFormData] = useState<FormData>(initialFormData);

    useEffect(() => {
      setPageTitle(
        `${route.asPath.includes('cadastrar') ? 'Cadastro' : 'Alterar'} Pessoa Jurídica`,
      );
    }, [route, setPageTitle]);

    const updateFormData = useCallback((data: any, address: any) => {
      setFormData({
        name: data.name || '',
        cnpj: cnpjMask(data.cnpj) || '',
        gender: data.gender || 'male',
        zip_code: cepMask(address.zip_code) || '',
        street: address.street || '',
        state: address.state || '',
        city: address.city || '',
        number: address.number || '',
        description: address.description || '',
        neighborhood: address.neighborhood || '',
      });
    }, []);

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (errors[name]) {
          const newErrors = { ...errors };
          delete newErrors[name];
          setErrors(newErrors);
        }

        setFormData(prevData => ({
          ...prevData,
          [name]: name === 'cnpj' ? cnpjMask(value) : name === 'zip_code' ? cepMask(value) : value,
        }));
      },
      [errors],
    );

    const fetchCEPDetails = useCallback(async (cep: string) => {
      try {
        const response = await getCEPDetails(cep);
        setFormData(prevData => ({
          ...prevData,
          state: response.state || prevData.state,
          city: response.city || prevData.city,
          street: response.street || prevData.street,
          neighborhood: response.neighborhood || prevData.neighborhood,
        }));
      } catch (error) {
        showNotification('CEP inválido.', 'error');
      }
    }, []);

    useEffect(() => {
      const numericCEP = formData.zip_code.replace(/\D/g, '');
      if (numericCEP.length === 8) {
        fetchCEPDetails(numericCEP);
      }
    }, [formData.zip_code, fetchCEPDetails]);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
      setNotification({ open: true, message, type });
    }, []);

    const handleFormError = useCallback(
      (error: unknown) => {
        showNotification('Corrija os erros no formulário.', 'error');

        if (error instanceof z.ZodError) {
          const fieldErrors = error.flatten().fieldErrors;
          const newErrors: Record<string, string> = {};

          for (const field in fieldErrors) {
            if (fieldErrors[field]) {
              newErrors[field] = fieldErrors[field]?.[0] || '';
            }
          }
          setErrors(newErrors);
        }

        scroll.scrollToTop({
          duration: 500,
          smooth: 'easeInOutQuart',
        });
      },
      [showNotification],
    );

    const saveDataLocalStorage = useCallback((data: CustomerData) => {
      localStorage.setItem('PJ/One', JSON.stringify(data));
    }, []);

    const prepareCustomerData = useCallback((): CustomerData => {
      return {
        name: formData.name.trim(),
        cnpj: formData.cnpj.replace(/\D/g, ''),
        gender: formData.gender,
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
            ...(editMode &&
              customerForm?.data?.attributes?.addresses[0]?.id && {
                id: customerForm.data.attributes.addresses[0].id,
              }),
          },
        ],
      };
    }, [formData, editMode, customerForm]);

    const handleSubmitForm = useCallback(() => {
      try {
        stepOneSchema.parse({
          name: formData.name,
          cnpj: formData.cnpj,
          street: formData.street,
          zip_code: formData.zip_code,
          neighborhood: formData.neighborhood,
          number: formData.number,
        });

        const data = prepareCustomerData();
        saveDataLocalStorage(data);

        if (editMode) {
          const updatedCustomerForm = { ...customerForm };
          if (updatedCustomerForm.data) {
            updatedCustomerForm.data.attributes = {
              ...updatedCustomerForm.data.attributes,
              name: formData.name.trim(),
              cnpj: formData.cnpj,
              gender: formData.gender,
              capacity: 'able',
              civil_status: 'single',
              cpf: '00000000000',
              rg: '000000000',
              nationality: 'brazilian',
              profession: 'company',
              addresses_attributes: data.addresses_attributes,
            };
          }

          setCustomerForm(updatedCustomerForm);
          setNewCustomerForm(data);
          nextStep();
          return;
        }

        setCustomerForm(data);
        nextStep();
      } catch (error) {
        handleFormError(error);
      }
    }, [
      formData,
      editMode,
      customerForm,
      prepareCustomerData,
      saveDataLocalStorage,
      setCustomerForm,
      setNewCustomerForm,
      nextStep,
      handleFormError,
    ]);

    React.useImperativeHandle(ref, () => ({
      handleSubmitForm,
    }));

    useEffect(() => {
      setLoading(true);

      const loadInitialData = () => {
        const localData = localStorage.getItem('PJ/One');

        if (localData) {
          const parsedData: CustomerData = JSON.parse(localData);
          const address = parsedData.addresses_attributes?.[0] || {};
          updateFormData(parsedData, address);

          setLoading(false);
        } else if (customerForm?.data) {
          const address = customerForm.data.attributes?.addresses?.[0] || {};
          updateFormData(customerForm.data.attributes, address);

          setLoading(false);
        }
      };

      loadInitialData();
    }, [customerForm]);

    return (
      <>
        <Notification
          open={notification.open}
          message={notification.message}
          severity={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        />

        <Container>
          {loading && (
            <LoadingOverlay>
              <CircularProgress size={30} style={{ color: '#01013D' }} />
            </LoadingOverlay>
          )}

          <form>
            <Box display="flex" flexDirection="column" gap="16px">
              <div style={{ display: 'flex', gap: '32px' }}>
                <Box width="210px">
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    Descrição da Empresa
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
                  placeholder="00.000.000/0000-00"
                  errorMessage={errors.cnpj}
                  handleInputChange={handleInputChange}
                />
              </div>

              <Divider />

              <div style={{ display: 'flex', gap: '32px' }}>
                <Box width="210px">
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    Endereço
                  </Typography>
                </Box>

                <Box display="flex" flexDirection="column" gap="16px" flex={1}>
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
                    <Box maxWidth="30%">
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
                <Box display="flex" flexDirection="column" gap="16px" flex={1}>
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
  },
);

PJCustomerStepOne.displayName = 'PJCustomerStepOne';
export default PJCustomerStepOne;
