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
import { z } from 'zod';

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
  cep: z.string().min(3, { message: 'CEP é obrigatório' }),
  street: z.string().min(1, { message: 'Endereço é obrigatório' }),
  state: z.string().min(1, { message: 'Estado é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatório' }),
  number: z.string().min(1, { message: 'Número é obrigatório' }),
  neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
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
    cep: customerForm.cep,
    street: customerForm.street,
    state: customerForm.state,
    city: customerForm.city,
    number: customerForm.number,
    description: customerForm.description,
    neighborhood: customerForm.neighborhood,
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
      if (errors.cep && errors.cep !== '') {
        setMessage('CEP inválido.');
        setType('error');
        setOpenSnackbar(true);
        return;
      }

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
          {renderInputField('CEP', 'cep', 'Informe o CEP', '100%', !!errors.cep)}
          <div style={{ display: 'flex', gap: '16px' }}>
            {renderInputField('Endereço', 'street', 'Informe o Endereço', '100%', !!errors.street)}
            {renderInputField('Número', 'number', 'N.º', '140px', !!errors.street)}
          </div>
          {renderInputField('Complemento', 'description', 'Informe o Complemento', '100%')}
          {renderInputField(
            'Bairro',
            'neighborhood',
            'Informe o Bairro',
            '100%',
            !!errors.neighborhood,
          )}
          {renderInputField('Cidade', 'city', 'Informe a Cidade', '100%', !!errors.city)}
          {renderInputField('Estado', 'state', 'Informe o Estado', '100%', !!errors.state)}
        </ColumnContainer>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepTwo);
