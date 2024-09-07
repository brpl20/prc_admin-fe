import { useState, useEffect, useContext, ChangeEvent } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { IoMdTrash } from 'react-icons/io';

import {
  TextField,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { CustomerContext } from '@/contexts/CustomerContext';
import { Container, Title } from './styles';
import { colors, ContentContainer, Divider } from '@/styles/globals';
import { createProfileCustomer, createCustomer, updateProfileCustomer } from '@/services/customers';
import { animateScroll as scroll } from 'react-scroll';
import Router, { useRouter } from 'next/router';
import { phoneMask } from '@/utils/masks';
import { z } from 'zod';

interface FormData {
  name: string;
  last_name: string;
  gender: string;
  accountant_id: string;
  civil_status: string;
  capacity: string;
  cpf: string;
  rg: string;
}

interface Props {
  pageTitle: string;
}

const counterSchema = z.object({
  name: z.string().min(4, 'Nome é obrigatório'),
  last_name: z.string().min(4, 'Sobrenome é obrigatório'),
  accountant_id: z.string().min(1, 'Registro Profissional é obrigatório'),
  phone_number: z.string().min(4, 'Telefone Obrigatório'),
  email: z.string().min(4, 'Email Obrigatório'),
});

const Counter = ({ pageTitle }: Props) => {
  const route = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { setShowTitle, setPageTitle } = useContext(PageTitleContext);
  const { customerForm } = useContext(CustomerContext);

  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    last_name: '',
    gender: '',
    accountant_id: '',
    civil_status: '',
    capacity: '',
    cpf: '',
    rg: '',
  });

  const [contactData, setContactData] = useState({
    phoneInputFields: [{ phone_number: '' }],
    emailInputFields: [{ email: '' }],
  });

  const resetValues = () => {
    setFormData({
      name: '',
      last_name: '',
      gender: '',
      accountant_id: '',
      civil_status: '',
      capacity: '',
      cpf: '',
      rg: '',
    });
    setContactData({
      phoneInputFields: [{ phone_number: '' }],
      emailInputFields: [{ email: '' }],
    });
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleContactChange = (
    index: number,
    value: string,
    inputArrayName: keyof typeof contactData,
  ) => {
    setContactData(prevData => {
      const newInputFields = [...prevData[inputArrayName]];
      newInputFields[index] =
        inputArrayName === 'phoneInputFields'
          ? { phone_number: phoneMask(value) }
          : { email: value };

      return { ...prevData, [inputArrayName]: newInputFields };
    });
  };

  const completeRegistration = async (data: any) => {
    try {
      const data_customer = { customer: { email: data.emails_attributes[0].email } };
      const customer_data = await createCustomer(data_customer);

      if (!customer_data.data.attributes.email) throw new Error('E-mail já está em uso !');

      const customer_id = customer_data.data.id;
      const newData = { ...data, customer_id: Number(customer_id) };
      await createProfileCustomer(newData);

      Router.push('/clientes');
      resetValues();
    } catch (error: any) {
      handleFormError(error);
      scroll.scrollToTop({ duration: 500, smooth: 'easeInOutQuart' });
    }
  };

  const handleSubmitForm = async () => {
    setLoading(true);
    try {
      counterSchema.parse({
        name: formData.name,
        last_name: formData.last_name,
        gender: formData.gender,
        accountant_id: formData.accountant_id.toString(),
        phone_number: contactData.phoneInputFields[0].phone_number,
        email: contactData.emailInputFields[0].email,
      });

      const data = {
        ...formData,
        gender: 'male',
        accountant_id: Number(formData.accountant_id),
        customer_type: 'counter',
        phones_attributes: contactData.phoneInputFields,
        emails_attributes: contactData.emailInputFields,
        capacity: 'able',
        cpf: '0000000000',
        nationality: 'brazilian',
        profession: 'counter',
        civil_status: 'single',
        rg: '000000',
      };

      if (isEditing) {
        const res = await updateProfileCustomer(customerForm.data.id, data);
        Router.push('/clientes');
        resetValues();
      } else {
        const res = await completeRegistration(data);

        if (res == undefined) {
          return;
        }

        Router.push('/clientes');
        resetValues();
      }
    } catch (err) {
      handleFormError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = (error: any) => {
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: Record<string, string> = {};
    const codeErrors = error?.response?.data?.errors;

    setMessage('Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);

    if (codeErrors?.length) {
      codeErrors.forEach((error: any) => {
        setMessage(error.code);
        setType('error');
        setOpenSnackbar(true);
      });
    }

    for (const field in newErrors) {
      if (newErrors.hasOwnProperty(field)) {
        errorObject[field] = newErrors[field][0] as string;
      }
    }
    setErrors(errorObject);
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const renderInputField = (
    name: keyof FormData,
    title: string,
    placeholderText: string,
    error?: boolean,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {title}
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        name={name}
        size="small"
        value={formData[name] || ''}
        autoComplete="off"
        placeholder={placeholderText}
        onChange={handleInputChange}
        error={error && !formData[name]}
      />
    </div>
  );

  const renderSelectField = (
    label: string,
    name: keyof FormData,
    options: { label: string; value: string }[],
    error?: boolean,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
    </div>
  );

  const handleAddInput = (inputArrayName: keyof typeof contactData) => {
    setContactData(prevData => {
      const newInputFields = [...prevData[inputArrayName]] as any;
      newInputFields.push({
        [inputArrayName === 'phoneInputFields' ? 'phone_number' : 'email']: '',
      });

      return { ...prevData, [inputArrayName]: newInputFields };
    });
  };

  useEffect(() => {
    if (customerForm.data?.attributes) {
      setFormData({
        name: customerForm.data.attributes.name || '',
        last_name: customerForm.data.attributes.last_name || '',
        gender: customerForm.data.attributes.gender || '',
        accountant_id: customerForm.data.attributes.accountant_id || '',
        civil_status: customerForm.data.attributes.civil_status || '',
        capacity: customerForm.data.attributes.capacity || '',
        cpf: customerForm.data.attributes.cpf || '',
        rg: customerForm.data.attributes.rg || '',
      });

      setContactData({
        phoneInputFields: customerForm.data.attributes.phones?.length
          ? customerForm.data.attributes.phones
          : [{ phone_number: '' }],
        emailInputFields: customerForm.data.attributes.emails?.length
          ? customerForm.data.attributes.emails
          : [{ email: '' }],
      });
    }
  }, [customerForm]);

  useEffect(() => {
    const updateScrollPosition = () => {
      setShowTitle(window.scrollY >= 49);
    };

    window.addEventListener('scroll', updateScrollPosition);
    return () => window.removeEventListener('scroll', updateScrollPosition);
  }, [setShowTitle]);

  useEffect(() => {
    setIsEditing(pageTitle.includes('terar'));
  }, [pageTitle]);

  useEffect(() => {
    setPageTitle(`${route.asPath.includes('cadastrar') ? 'Cadastro de' : 'Alterar'} Contador`);
  }, [route, setPageTitle]);

  const handleRemoveContact = (removeIndex: number, inputArrayName: keyof typeof contactData) => {
    setContactData(prevData => {
      if (prevData[inputArrayName].length === 1) return prevData;

      const updatedFields = [...prevData[inputArrayName]];
      updatedFields.splice(removeIndex, 1);
      return { ...prevData, [inputArrayName]: updatedFields };
    });
  };

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

      {openModal && (
        <ConfirmCreation
          isLoading={loading}
          isOpen={openModal}
          editMode={isEditing}
          onClose={handleCloseModal}
          handleSave={handleSubmitForm}
        />
      )}

      <Container>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ marginBottom: '24px', maxWidth: '1600px' }}
        >
          <Title>{pageTitle}</Title>
        </Box>

        <ContentContainer>
          <form>
            <Box display="flex" flexDirection="column" gap="16px">
              <div style={{ display: 'flex', gap: '32px' }}>
                <Box width="210px">
                  <Typography variant="h6">Registro Profissional</Typography>
                </Box>
                <Box flex={1}>
                  <Box width="50%" pr="15.5px">
                    {renderInputField(
                      'accountant_id',
                      'Número do Registro',
                      'Informe o Número',
                      !!errors.accountant_id,
                    )}
                  </Box>
                </Box>
              </div>

              <Divider />

              <div style={{ display: 'flex', gap: '32px' }}>
                <Box width="210px">
                  <Typography variant="h6">Dados do Contador</Typography>
                </Box>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '32px', flex: 1, marginTop: '24px' }}>
                    <Box display="flex" flexDirection="column" gap="16px" flex={1}>
                      {renderInputField('name', 'Nome', 'Nome do Contador', !!errors.name)}
                    </Box>

                    <Box display="flex" flexDirection="column" gap="16px" flex={1}>
                      {renderInputField(
                        'last_name',
                        'Sobrenome',
                        'Sobrenome do Contador',
                        !!errors.last_name,
                      )}
                    </Box>
                  </div>
                </div>
              </div>

              <Divider />

              <div style={{ display: 'flex', gap: '32px' }}>
                <Box width="210px">
                  <Typography variant="h6">Contato</Typography>
                </Box>

                <div style={{ display: 'flex', gap: '32px', flex: 1 }}>
                  <Box flex={1}>
                    <Typography style={{ marginBottom: '8px' }} variant="h6">
                      Telefone
                    </Typography>

                    {contactData.phoneInputFields.map((inputValue, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          marginBottom: '8px',
                          gap: '6px',
                        }}
                      >
                        <div className="flex flex-row gap-1">
                          <TextField
                            variant="outlined"
                            fullWidth
                            name="phone"
                            size="small"
                            placeholder="Informe o Telefone"
                            value={inputValue.phone_number || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleContactChange(index, e.target.value, 'phoneInputFields')
                            }
                            autoComplete="off"
                            error={!!errors.phone_number}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(index, 'phoneInputFields')}
                          >
                            <div
                              className={`flex ${
                                contactData.phoneInputFields.length > 1 ? '' : 'hidden'
                              }`}
                            >
                              <IoMdTrash size={20} color="#a50000" />
                            </div>
                          </button>
                        </div>

                        {index === contactData.phoneInputFields.length - 1 && (
                          <IoAddCircleOutline
                            className={`cursor-pointer ml-auto ${
                              contactData.phoneInputFields.length > 1 ? 'mr-6' : ''
                            }`}
                            onClick={() => handleAddInput('phoneInputFields')}
                            color={colors.quartiary}
                            size={20}
                          />
                        )}
                      </div>
                    ))}
                  </Box>
                  <Box flex={1}>
                    <Typography style={{ marginBottom: '8px' }} variant="h6">
                      E-mail
                    </Typography>

                    {contactData.emailInputFields.map((inputValue, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          marginBottom: '8px',
                          gap: '6px',
                        }}
                      >
                        <div className="flex flex-row gap-1">
                          <TextField
                            variant="outlined"
                            fullWidth
                            name="email"
                            size="small"
                            placeholder="Informe o Email"
                            value={inputValue.email || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleContactChange(index, e.target.value, 'emailInputFields')
                            }
                            autoComplete="off"
                            error={!!errors.email}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(index, 'emailInputFields')}
                          >
                            <div
                              className={`flex ${
                                contactData.emailInputFields.length > 1 ? '' : 'hidden'
                              }`}
                            >
                              <IoMdTrash size={20} color="#a50000" />
                            </div>
                          </button>
                        </div>

                        {index === contactData.emailInputFields.length - 1 && (
                          <IoAddCircleOutline
                            className={`cursor-pointer ml-auto ${
                              contactData.emailInputFields.length > 1 ? 'mr-6' : ''
                            }`}
                            onClick={() => handleAddInput('emailInputFields')}
                            color={colors.quartiary}
                            size={20}
                          />
                        )}
                      </div>
                    ))}
                  </Box>
                </div>
              </div>
            </Box>
          </form>

          <Divider />

          <Box display="flex" justifyContent="end" mt="16px">
            <Button
              color="primary"
              variant="outlined"
              sx={{ width: '100px', height: '36px' }}
              onClick={() => {
                resetValues();
                Router.push('/clientes');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              sx={{ width: '100px', height: '36px', color: colors.white, marginLeft: '16px' }}
              color="secondary"
              onClick={handleSubmitForm}
            >
              {loading ? <CircularProgress size={20} sx={{ color: colors.white }} /> : 'Salvar'}
            </Button>
          </Box>
        </ContentContainer>
      </Container>
    </>
  );
};

export default Counter;
