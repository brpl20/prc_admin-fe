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
import { Flex, Divider } from '@/styles/globals';
import Notification from '@/components/Notification';
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
  name: string | undefined;
  cnpj: string | undefined;
  cep: string;
  gender: string;
  street: string;
  state: string;
  city: string;
  number: string;
  description: string;
  neighborhood: string;
}

const stepOneSchema = z.object({
  name: z.string().nonempty('Nome é obrigatório.'),
  cnpj: z.string().nonempty('CNPJ é obrigatório.'),
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

  const [formData, setFormData] = useState<FormData>({
    name: '',
    cnpj: '',
    cep: '',
    street: '',
    state: '',
    city: '',
    gender: 'male',
    number: '',
    description: '',
    neighborhood: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cnpj') {
      setFormData(prevData => ({
        ...prevData,
        [name]: cnpjMask(value),
      }));
      return;
    }

    if (name === 'cep') {
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
            zip_code: formData.cep,
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
        customerForm.data.attributes.cnpj = formData.cnpj ? cnpjMask(formData.cnpj) : '';
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
            zip_code: formData.cep,
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
          cep: address.zip_code,
          street: address.street,
          state: address.state,
          city: address.city,
          number: address.number,
          description: address.description,
          neighborhood: address.neighborhood,
        }));
      }

      const cnpj = parsedData.cnpj ? cnpjMask(parsedData.cnpj) : '';
      const name = parsedData.name ? parsedData.name : '';
      const gender = parsedData.gender;

      setFormData(prevData => ({
        ...prevData,
        cnpj,
        name,
        gender,
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
    <Flex style={{ flexDirection: 'column', flex: 1 }}>
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
    </Flex>
  );

  useEffect(() => {
    const fetchCEPDetails = async () => {
      const numericCEP = formData.cep.replace(/\D/g, '');

      if (numericCEP.length === 8) {
        try {
          const response = await getCEPDetails(numericCEP);
          setFormData(prevData => ({
            ...prevData,
            state: response.state,
            city: response.city,
          }));
        } catch (error: any) {
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
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        setFormData(prevData => ({
          ...prevData,
          name: attributes.name,
          cnpj: attributes.cnpj ? cnpjMask(attributes.cnpj) : '',
          gender: attributes.gender,
        }));

        if (customerForm.data.attributes.addresses.length > 0) {
          const lastAddress =
            customerForm.data.attributes.addresses[
              customerForm.data.attributes.addresses.length - 1
            ];

          setFormData(prevData => ({
            ...prevData,
            cep: lastAddress.zip_code,
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
            <Flex style={{ gap: '32px' }}>
              <Box width={'210px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Descrição da Empresa'}
                </Typography>
              </Box>
              {renderInputField('name', 'Nome', 'Nome da Empresa', !!errors.name)}
              {renderInputField('cnpj', 'Número do CNPJ', '00.000.000/000-00', !!errors.cnpj)}
            </Flex>

            <Divider />

            <Flex style={{ gap: '32px' }}>
              <Box width={'210px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Endereço'}
                </Typography>
              </Box>

              <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                {renderInputField('cep', 'CEP', 'Informe o CEP', !!errors.CEP)}
                <Flex style={{ gap: '16px' }}>
                  {renderInputField(
                    'street',
                    'Endereço',
                    'Informe o Endereço',

                    !!errors.street,
                  )}
                  <Box maxWidth={'30%'}>
                    {renderInputField('number', 'Número', 'N.º', !!errors.street)}
                  </Box>
                </Flex>
                {renderInputField('description', 'Complemento', 'Informe o Estado', !!errors.state)}
              </Box>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                {renderInputField('neighborhood', 'Bairro', 'Informe o Estado', !!errors.state)}
                {renderInputField('city', 'Cidade', 'Informe a Cidade', !!errors.city)}
                {renderInputField('state', 'Estado', 'Informe o Estado', !!errors.state)}
              </Box>
            </Flex>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default forwardRef(PJCustomerStepOne);
