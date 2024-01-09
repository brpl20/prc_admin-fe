import React, { useState, ChangeEvent, useEffect, useContext } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';

import {
  TextField,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import { CustomerContext } from '@/contexts/CustomerContext';

import { Container, Title } from './styles';
import { colors, ContentContainer } from '@/styles/globals';

import { Flex, Divider } from '@/styles/globals';
import { createProfileCustomer, createCustomer, updateProfileCustomer } from '@/services/customers';
import { animateScroll as scroll } from 'react-scroll';

import Router from 'next/router';
import { set } from 'date-fns';
import { capacityOptions, civilStatusOptions, gendersOptions } from '@/utils/constants';
import { cpfMask, rgMask } from '@/utils/masks';

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

interface props {
  pageTitle: string;
}

const Counter = ({ pageTitle }: props) => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { setShowTitle, setPageTitle } = useContext(PageTitleContext);
  const { customerForm } = useContext(CustomerContext);

  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

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

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleContactChange = (
    index: number,
    value: string,
    inputArrayName: keyof typeof contactData,
  ) => {
    setContactData(prevData => {
      const newInputFields = [...prevData[inputArrayName]];

      if (inputArrayName === 'phoneInputFields') {
        if (newInputFields[index]) {
          newInputFields[index] = {
            ...newInputFields[index],
            phone_number: value,
          };
        } else {
          newInputFields.push({ phone_number: value });
        }
      } else if (inputArrayName === 'emailInputFields') {
        if (newInputFields[index]) {
          newInputFields[index] = {
            ...newInputFields[index],
            email: value,
          };
        } else {
          newInputFields.push({ email: value });
        }
      }

      return {
        ...prevData,
        [inputArrayName]: newInputFields,
      };
    });
  };

  const completeRegistration = async (data: any) => {
    try {
      const data_customer = {
        customer: {
          email: data.emails_attributes[0].email,
          password: '123456',
          password_confirmation: '123456',
        },
      };
      const customer_data = await createCustomer(data_customer);

      if (!customer_data.data.attributes.email) {
        throw new Error('E-mail já está em uso !');
      } else {
        const customer_id = customer_data.data.id;

        const newData = {
          ...data,
          customer_id: Number(customer_id),
        };

        const res = await createProfileCustomer(newData);

        Router.push('/clientes');
        resetValues();
      }
    } catch (error: any) {
      const message = error.request.response ? JSON.parse(error.request.response).errors[0] : '';
      setMessage(message.code);
      setType('error');
      setOpenSnackbar(true);

      scroll.scrollToTop({
        duration: 500,
        smooth: 'easeInOutQuart',
      });
    }
  };

  const handleSubmitForm = async () => {
    setLoading(true);

    try {
      if (!formData.accountant_id) throw new Error('Registro Profissional é obrigatório');
      if (!formData.cpf) throw new Error('CPF é obrigatório');
      if (!formData.rg) throw new Error('RG é obrigatório');
      if (!formData.name) throw new Error('Nome é obrigatório');
      if (!formData.last_name) throw new Error('Sobrenome é obrigatório');
      if (!formData.gender) throw new Error('Gênero é obrigatório');
      if (!formData.civil_status) throw new Error('Estado Civil é obrigatório');
      if (contactData.phoneInputFields.some(field => field.phone_number.trim() === '')) {
        throw new Error('Preencha o campo Telefone.');
      }

      if (contactData.emailInputFields.some(field => field.email.trim() === '')) {
        throw new Error('Preencha o campo Email.');
      }

      const data = {
        name: formData.name,
        last_name: formData.last_name,
        gender: formData.gender,
        accountant_id: Number(formData.accountant_id),
        customer_type: 'counter',
        phones_attributes: contactData.phoneInputFields,
        emails_attributes: contactData.emailInputFields,
        capacity: 'able',
        cpf: formData.cpf,
        nationality: 'brazilian',
        profession: 'counter',
        civil_status: formData.civil_status,
        rg: formData.rg,
      };

      if (pageTitle.search('terar') !== -1) {
        customerForm.data.attributes.name = data.name;
        customerForm.data.attributes.last_name = data.last_name;
        customerForm.data.attributes.gender = data.gender;
        customerForm.data.attributes.accountant_id = data.accountant_id;
        customerForm.data.attributes.phones = data.phones_attributes;
        customerForm.data.attributes.emails = data.emails_attributes;
        customerForm.data.attributes.capacity = data.capacity;
        customerForm.data.attributes.gender = data.gender;
        customerForm.data.attributes.civil_status = data.civil_status;
        customerForm.data.attributes.rg = data.rg;
        customerForm.data.attributes.cpf = data.cpf;

        const newData = {
          name: customerForm.data.attributes.name,
          last_name: customerForm.data.attributes.last_name,
          gender: customerForm.data.attributes.gender,
          accountant_id: customerForm.data.attributes.accountant_id,
          customer_type: 'counter',
          phones_attributes: customerForm.data.attributes.phones,
          emails_attributes: customerForm.data.attributes.emails,
          capacity: 'able',
          cpf: customerForm.data.attributes.cpf,
          nationality: 'brazilian',
          profession: 'counter',
          civil_status: customerForm.data.attributes.civil_status,
          rg: customerForm.data.attributes.rg,
        };

        const res = await updateProfileCustomer(customerForm.data.id, newData);

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
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const renderInputField = (name: keyof FormData, title: string, placeholderText: string) => (
    <Flex style={{ flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {title}
      </Typography>
      <TextField
        id="outlined-basic"
        variant="outlined"
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

  const handleAddInput = (inputArrayName: keyof typeof contactData) => {
    setContactData(prevData => {
      const newInputFields = [...prevData[inputArrayName]] as any;
      newInputFields.push({
        [inputArrayName === 'phoneInputFields' ? 'phone_number' : 'email']: '',
      });

      return {
        ...prevData,
        [inputArrayName]: newInputFields,
      };
    });
  };

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        setFormData({
          name: attributes.name ? attributes.name : '',
          last_name: attributes.last_name ? attributes.last_name : '',
          gender: attributes.gender ? attributes.gender : '',
          accountant_id: attributes.accountant_id ? attributes.accountant_id : '',
          civil_status: attributes.civil_status ? attributes.civil_status : '',
          capacity: attributes.capacity ? attributes.capacity : '',
          cpf: attributes.cpf ? cpfMask(attributes.cpf) : '',
          rg: attributes.rg ? rgMask(attributes.rg) : '',
        });

        setContactData({
          phoneInputFields: attributes.phones ? attributes.phones : [{ phone_number: '' }],
          emailInputFields: attributes.emails ? attributes.emails : [{ email: '' }],
        });
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm]);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
        setPageTitle(pageTitle);
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
        setPageTitle('');
      }
    };

    window.addEventListener('scroll', updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, []);

  useEffect(() => {
    if (pageTitle.search('terar') !== -1) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [pageTitle]);

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
          display={'flex'}
          alignItems={'center'}
          justifyContent={'space-between'}
          sx={{
            marginBottom: '24px',
            maxWidth: '1600px',
          }}
        >
          <Title>{`${pageTitle}`}</Title>
        </Box>

        <ContentContainer>
          <form>
            <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
              <Flex style={{ gap: '32px' }}>
                <Box width={'210px'}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {'Registro Profissional'}
                  </Typography>
                </Box>
                <Box style={{ flex: 1 }}>
                  <Box width={'50%'} pr={'15.5px'}>
                    {renderInputField('accountant_id', 'Número do Registro', 'Informe o Número')}
                  </Box>
                </Box>
              </Flex>

              <Divider />

              <Flex style={{ gap: '32px' }}>
                <Box width={'210px'}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {'Dados do Contador'}
                  </Typography>
                </Box>

                <Flex
                  style={{
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <Flex style={{ gap: '24px' }}>
                    {renderInputField('cpf', 'CPF', 'CPF do Contador')}
                    {renderInputField('rg', 'RG', 'RG do Contador')}
                  </Flex>

                  <Flex
                    style={{
                      gap: '32px',
                      flex: 1,
                      marginTop: '24px',
                    }}
                  >
                    <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                      {renderInputField('name', 'Nome', 'Nome do Contador')}
                    </Box>

                    <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                      {renderInputField('last_name', 'Sobrenome', 'Sobrenome do Contador')}
                    </Box>
                  </Flex>
                  <Box display={'flex'} gap={4} mt={'24px'}>
                    {renderSelectField('Gênero', 'gender', gendersOptions)}
                    {renderSelectField('Estado Civil', 'civil_status', civilStatusOptions)}
                  </Box>
                </Flex>
              </Flex>

              <Divider />

              <Flex style={{ gap: '32px' }}>
                <Box width={'210px'}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {'Contato'}
                  </Typography>
                </Box>

                <Flex style={{ gap: '32px', flex: 1 }}>
                  <Box
                    style={{
                      flex: 1,
                    }}
                  >
                    <Typography style={{ marginBottom: '8px' }} variant="h6">
                      {'Telefone'}
                    </Typography>
                    {contactData.phoneInputFields.map((inputValue, index) => (
                      <Flex
                        key={index}
                        style={{
                          flexDirection: 'column',
                          marginBottom: '8px',
                          gap: '6px',
                        }}
                      >
                        <TextField
                          id="outlined-basic"
                          variant="outlined"
                          fullWidth
                          name="phone"
                          size="small"
                          placeholder="Informe o Telefone"
                          value={inputValue.phone_number || ''}
                          onChange={(e: any) =>
                            handleContactChange(index, e.target.value, 'phoneInputFields')
                          }
                          autoComplete="off"
                        />
                        {index === contactData.phoneInputFields.length - 1 && (
                          <IoAddCircleOutline
                            style={{ marginLeft: 'auto', cursor: 'pointer' }}
                            onClick={() => handleAddInput('phoneInputFields')}
                            color={colors.quartiary}
                            size={20}
                          />
                        )}
                      </Flex>
                    ))}
                  </Box>
                  <Box
                    style={{
                      flex: 1,
                    }}
                  >
                    <Typography style={{ marginBottom: '8px' }} variant="h6">
                      {'E-mail'}
                    </Typography>
                    {contactData.emailInputFields.map((inputValue, index) => (
                      <Flex
                        key={index}
                        style={{
                          flexDirection: 'column',
                          marginBottom: '8px',
                          gap: '6px',
                        }}
                      >
                        <TextField
                          id="outlined-basic"
                          variant="outlined"
                          fullWidth
                          name="email"
                          size="small"
                          style={{ flex: 1 }}
                          placeholder="Informe o Email"
                          value={inputValue.email || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleContactChange(index, e.target.value, 'emailInputFields')
                          }
                          error={
                            !/^\S+@\S+\.\S+$/.test(inputValue.email) && inputValue.email !== ''
                          }
                          autoComplete="off"
                        />
                        {index === contactData.emailInputFields.length - 1 && (
                          <IoAddCircleOutline
                            style={{ marginLeft: 'auto', cursor: 'pointer' }}
                            onClick={() => handleAddInput('emailInputFields')}
                            color={colors.quartiary}
                            size={20}
                          />
                        )}
                      </Flex>
                    ))}
                  </Box>
                </Flex>
              </Flex>
            </Box>
          </form>

          <Divider />

          <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'16px'}>
            <Button
              color="primary"
              variant="outlined"
              sx={{
                width: '100px',
                height: '36px',
              }}
              onClick={() => {
                resetValues();
                Router.push('/clientes');
              }}
            >
              {'Cancelar'}
            </Button>
            <Button
              variant="contained"
              sx={{
                width: '100px',
                height: '36px',
                color: colors.white,
                marginLeft: '16px',
              }}
              color="secondary"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              {'Salvar'}
            </Button>
          </Box>
        </ContentContainer>
      </Container>
    </>
  );
};

export default Counter;
