import React, {
  useState,
  useEffect,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { Container, ColumnContainer } from '../styles';
import { Notification } from '@/components';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import { getCEPDetails } from '@/services/brasilAPI';
import { TextField, Typography } from '@mui/material';
import { cepMask } from '@/utils/masks';
import { z, ZodError } from 'zod';
import { isValidCEP } from '@/utils/validator';
import CustomTextField from '@/components/FormInputFields/CustomTextField';

export interface IRefPFCustomerStepTwoProps {
  handleSubmitForm: () => void;
}

interface IStepTwoProps {
  nextStep: () => void;
  editMode: boolean;
}

interface FormData {
  cep: string;
  street: string;
  state: string;
  city: string;
  number: string;
  description: string;
  neighborhood: string;
}

const stepTwoSchema = z.object({
  cep: z
    .string()
    .min(8, { message: 'O CEP precisa ter no mínimo 8 dígitos.' })
    .refine(isValidCEP, { message: 'O CEP informado é inválido.' }),
  street: z.string().min(1, { message: 'Endereço é um campo obrigatório.' }),
  state: z.string().min(1, { message: 'Estado é um campo obrigatório.' }),
  city: z.string().min(1, { message: 'Cidade é um campo obrigatório.' }),
  number: z.string().min(1, { message: 'Número é um campo obrigatório.' }),
  neighborhood: z.string().min(1, { message: 'Bairro é um campo obrigatório.' }),
  description: z.string().optional(),
});

const PFCustomerStepTwo: ForwardRefRenderFunction<IRefPFCustomerStepTwoProps, IStepTwoProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({} as any);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext(CustomerContext);
  const [formData, setFormData] = useState<FormData>({
    cep: customerForm.cep || '',
    street: customerForm.street || '',
    state: customerForm.state || '',
    city: customerForm.city || '',
    number: customerForm.number || '',
    description: customerForm.description || '',
    neighborhood: customerForm.neighborhood || '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cep') {
      setFormData(prevData => ({
        ...prevData,
        ['street']: '',
        ['number']: '',
        ['description']: '',
        ['state']: '',
        ['city']: '',
        ['neighborhood']: '',
      }));
    }

    if (name === 'cep') {
      setFormData(prevData => ({
        ...prevData,
        [name]: cepMask(value),
      }));

      if (errors.cep) {
        setErrors({});
      }
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PF/Two');

    if (data) {
      const client = JSON.parse(data);
      const address_attributes = client.addresses_attributes[0];

      setFormData({
        cep: address_attributes.zip_code,
        street: address_attributes.street,
        number: address_attributes.number,
        description: address_attributes.description,
        neighborhood: address_attributes.neighborhood,
        state: address_attributes.state,
        city: address_attributes.city,
      });
    }
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('PF/Two', JSON.stringify(data));
  };

  const handleSubmitForm = () => {
    try {
      saveDataLocalStorage({
        ...customerForm,
        addresses_attributes: [
          {
            description: formData.description,
            zip_code: formData.cep,
            street: formData.street,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
        ],
      });

      stepTwoSchema.parse({
        cep: formData.cep,
        street: formData.street,
        state: formData.state,
        city: formData.city,
        number: formData.number?.toString(),
        neighborhood: formData.neighborhood,
      });

      console.log(formData);

      if (editMode) {
        customerForm.data.attributes.addresses_attributes = [
          {
            id: customerForm?.data?.attributes?.addresses[0]?.id ?? '',
            description: formData.description,
            zip_code: formData.cep,
            street: formData.street,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
        ];

        setCustomerForm(customerForm);
        setNewCustomerForm({
          ...newCustomerForm,
          addresses_attributes: [
            {
              id: customerForm?.data?.attributes?.addresses[0]?.id ?? '',
              description: formData.description,
              zip_code: formData.cep,
              street: formData.street,
              number: formData.number,
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state,
            },
          ],
        });
        nextStep();
        return;
      }

      setCustomerForm({
        ...customerForm,
        addresses_attributes: [
          {
            description: formData.description,
            zip_code: formData.cep,
            street: formData.street,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
        ],
      });

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

  const renderInputField = (
    label: string,
    name: keyof FormData,
    placeholderValue: string,
    widthValue: string,
    error?: boolean,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${widthValue}` }}>
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
        value={formData[name] ? formData[name] : ''}
        autoComplete="off"
        placeholder={`${placeholderValue}`}
        onChange={handleInputChange}
      />
    </div>
  );

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        const addresses = attributes.addresses[0]
          ? attributes.addresses[0]
          : [
              {
                description: '',
                zip_code: '',
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: '',
              },
            ];
        setFormData(prevData => ({
          ...prevData,
          cep: addresses.zip_code,
          street: addresses.street,
          state: addresses.state,
          city: addresses.city,
          number: addresses.number,
          description: addresses.description,
          neighborhood: addresses.neighborhood,
        }));
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm.data]);

  useEffect(() => {
    const fetchCEPDetails = async () => {
      if (formData.street !== '') {
        return;
      }

      const numericCEP = formData.cep.replace(/\D/g, '');

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
          setErrors({
            ...errors,
            cep: 'CEP inválido.',
          });
          setMessage('CEP inválido.');
          setType('error');
          setOpenSnackbar(true);
        }
      }
    };

    if (formData.cep) {
      fetchCEPDetails();
    }
  }, [formData.cep]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, []);

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
        <ColumnContainer>
          <CustomTextField
            formData={formData}
            label="CEP"
            name="cep"
            errorMessage={errors.cep}
            handleInputChange={handleInputChange}
          />

          <div style={{ display: 'flex', gap: '16px' }}>
            <CustomTextField
              formData={formData}
              label="Endereço"
              name="street"
              errorMessage={errors.street}
              handleInputChange={handleInputChange}
              sx={{ flex: 3 }}
            />

            <CustomTextField
              formData={formData}
              label="Número"
              name="number"
              placeholder="N.º"
              errorMessage={errors.number ? 'Obrigatório' : undefined}
              handleInputChange={handleInputChange}
            />
          </div>

          <CustomTextField
            formData={formData}
            label="Complemento"
            name="description"
            errorMessage={errors.description}
            handleInputChange={handleInputChange}
          />

          <CustomTextField
            formData={formData}
            label="Bairro"
            name="neighborhood"
            errorMessage={errors.neighborhood}
            handleInputChange={handleInputChange}
          />

          <CustomTextField
            formData={formData}
            label="Cidade"
            name="city"
            errorMessage={errors.city}
            handleInputChange={handleInputChange}
          />

          <CustomTextField
            formData={formData}
            label="Estado"
            name="state"
            errorMessage={errors.state}
            handleInputChange={handleInputChange}
          />
        </ColumnContainer>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepTwo);
