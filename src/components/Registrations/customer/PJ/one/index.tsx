import React, {
  useContext,
  useState,
  useEffect,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { TextField, Box, Typography } from '@mui/material';
import { getCEPDetails } from '@/services/brasilAPI';

import { Container } from '../styles';

import { z } from 'zod';
import { Divider } from '@/styles/globals';
import { Notification } from '@/components';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { cepMask, cnpjMask } from '@/utils/masks';
import { useRouter } from 'next/router';

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
  name: z.string().min(2, { message: 'Nome é obrigatório.' }),
  cnpj: z.string().min(2, { message: 'CNPJ é obrigatório.' }),
  zip_code: z.string().min(8, { message: 'CEP é obrigatório.' }),
  street: z.string().min(2, { message: 'Endereço é obrigatório.' }),
  neighborhood: z.string().min(2, { message: 'Bairro é obrigatório.' }),
});

const PJCustomerStepOne: ForwardRefRenderFunction<IRefPJCustomerStepOneProps, IStepOneProps> = (
  { nextStep, editMode },
  ref,
) => {
  const route = useRouter();
  const [errors, setErrors] = useState({} as any);
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const { setPageTitle } = useContext(PageTitleContext);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState<FormData>({} as FormData);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cnpj' && !/^\d*$/.test(value)) {
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
        name: formData.name,
        cnpj: formData.cnpj,
        street: formData.street,
        zip_code: formData.zip_code,
        neighborhood: formData.neighborhood,
        number: formData.number,
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

      if (address) {
        setFormData(prevData => ({
          ...prevData,
          zip_code: address.zip_code,
          street: address.street,
          state: address.state,
          city: address.city,
          number: address.number,
          description: address.description,
          neighborhood: address.neighborhood,
        }));
      } else {
        const cnpj = parsedData.cnpj ? parsedData.cnpj : '';
        const name = parsedData.name ? parsedData.name : '';
        const gender = parsedData.gender;

        setFormData(prevData => ({
          ...prevData,
          cnpj,
          name,
          gender,
        }));
      }
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

  const renderInputField = (
    name: keyof FormData,
    title: string,
    placeholderText: string,
    error: boolean,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {title}
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
        placeholder={`${placeholderText}`}
        onChange={handleInputChange}
      />
    </div>
  );

  useEffect(() => {
    const fetchCEPDetails = async () => {
      const numericCEP = formData.zip_code.replace(/\D/g, '');

      if (numericCEP.length === 8) {
        try {
          const response = await getCEPDetails(numericCEP);
          setFormData(prevData => ({
            ...prevData,
            state: response.state,
            city: response.city,
            street: response.street,
            neighborhood: response.neighborhood,
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
              {renderInputField('name', 'Nome', 'Nome', !!errors.name)}
              {renderInputField('cnpj', 'Número do CNPJ', '00.000.000/000-00', !!errors.cnpj)}
            </div>

            <Divider />

            <div style={{ display: 'flex', gap: '32px' }}>
              <Box width={'210px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Endereço'}
                </Typography>
              </Box>

              <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                {renderInputField('zip_code', 'CEP', 'Informe o CEP', errors.zip_code)}
                <div style={{ display: 'flex', gap: '16px' }}>
                  {renderInputField(
                    'street',
                    'Endereço',
                    'Informe o Endereço',

                    !!errors.street,
                  )}
                  <Box maxWidth={'30%'}>
                    {renderInputField('number', 'Número', 'N.º', !!errors.number)}
                  </Box>
                </div>
                {renderInputField(
                  'description',
                  'Complemento',
                  'Informe o Complemento',
                  !!errors.description,
                )}
              </Box>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                {renderInputField(
                  'neighborhood',
                  'Bairro',
                  'Informe o Bairro',
                  !!errors.neighborhood,
                )}
                {renderInputField('city', 'Cidade', 'Informe a Cidade', !!errors.city)}
                {renderInputField('state', 'Estado', 'Informe o Estado', !!errors.state)}
              </Box>
            </div>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default forwardRef(PJCustomerStepOne);
