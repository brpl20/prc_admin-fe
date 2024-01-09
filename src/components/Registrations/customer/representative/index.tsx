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
  Autocomplete,
} from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import { CustomerContext } from '@/contexts/CustomerContext';
import { gendersOptions, civilStatusOptions, nationalityOptions } from '@/utils/constants';

import { Container, Title } from './styles';
import { colors, ContentContainer } from '@/styles/globals';

import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Flex, Divider } from '@/styles/globals';
import {
  createProfileCustomer,
  getAllCustomers,
  createCustomer as createCustomerApi,
  updateProfileCustomer,
} from '@/services/customers';
import { animateScroll as scroll } from 'react-scroll';

import Router, { useRouter } from 'next/router';
import { cpfMask, rgMask } from '@/utils/masks';
import { getAllAdmins } from '@/services/admins';
import { IAdminProps } from '@/interfaces/IAdmin';

interface FormData {
  represent_id: string;
  name: string;
  last_name: string;
  CPF: string;
  RG: string;
  gender: string;
  civil_status: string;
  nationality: string;
  birth: Dayjs | string;
}

interface props {
  pageTitle: string;
}

const Representative = ({ pageTitle }: props) => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [adminsList, setAdminsList] = useState<IAdminProps[]>([]);

  const { customerForm } = useContext(CustomerContext);
  const { setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const currentDate = dayjs();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const route = useRouter();

  const [formData, setFormData] = useState<FormData>({
    represent_id: '',
    name: '',
    last_name: '',
    CPF: '',
    RG: '',
    gender: '',
    civil_status: '',
    nationality: '',
    birth: currentDate,
  });

  const [contactData, setContactData] = useState({
    phoneInputFields: [{ phone_number: '' }],
    emailInputFields: [{ email: '' }],
  });

  const resetValues = () => {
    setFormData({
      represent_id: '',
      name: '',
      last_name: '',
      CPF: '',
      RG: '',
      gender: '',
      civil_status: '',
      nationality: '',
      birth: currentDate,
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

    if (name === 'CPF') {
      setFormData(prevData => ({
        ...prevData,
        CPF: cpfMask(value),
      }));
    } else if (name === 'RG') {
      setFormData(prevData => ({
        ...prevData,
        RG: rgMask(value),
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
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

  const createCustomer = async (data: any) => {
    const response = await createCustomerApi(data);

    return response;
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
      if (formData.represent_id == '') {
        throw new Error('Selecione o Representado.');
      }

      if (formData.name == '') {
        throw new Error('Preencha o campo Nome.');
      }

      if (formData.last_name == '') {
        throw new Error('Preencha o campo Sobrenome.');
      }

      if (formData.CPF == '') {
        throw new Error('Preencha o campo CPF.');
      }

      if (formData.RG == '') {
        throw new Error('Preencha o campo RG.');
      }

      if (formData.birth == '') {
        throw new Error('Preencha o campo Data de Nascimento.');
      }

      if (formData.nationality == '') {
        throw new Error('Preencha o campo Naturalidade.');
      }

      if (formData.gender == '') {
        throw new Error('Preencha o campo Gênero.');
      }

      if (formData.civil_status == '') {
        throw new Error('Preencha o campo Estado Civil.');
      }

      if (contactData.phoneInputFields.some(field => field.phone_number.trim() === '')) {
        throw new Error('Preencha o campo Telefone.');
      }

      if (contactData.emailInputFields.some(field => field.email.trim() === '')) {
        throw new Error('Preencha o campo Email.');
      }

      if (route.pathname.includes('alterar')) {
        const data = {
          capacity: 'able',
          profession: 'representative',
          customer_type: 'representative',
          cpf: formData.CPF,
          rg: formData.RG,
          gender: formData.gender,
          nationality: formData.nationality,
          name: formData.name,
          last_name: formData.last_name,
          birth: formData.birth,
          civil_status: formData.civil_status,
          phones_attributes: contactData.phoneInputFields,
          emails_attributes: contactData.emailInputFields,
          represent_attributes: {
            id:
              customerForm.data.attributes.represent && customerForm.data.attributes.represent.id
                ? customerForm.data.attributes.represent.id
                : '',
            profile_admin_id: formData.represent_id ? Number(formData.represent_id) : '',
          },
        };

        const id = customerForm.data.id;

        await updateProfileCustomer(id, data);

        Router.push('/clientes');
        resetValues();
      } else {
        const data = {
          capacity: 'able',
          profession: 'representative',
          customer_type: 'representative',
          cpf: formData.CPF.replace(/\D/g, ''),
          rg: formData.RG.replace(/\D/g, ''),
          gender: formData.gender,
          nationality: formData.nationality,
          name: formData.name,
          last_name: formData.last_name,
          birth: formData.birth,
          civil_status: formData.civil_status,
          phones_attributes: contactData.phoneInputFields,
          emails_attributes: contactData.emailInputFields,
          represent_attributes: {
            profile_admin_id: formData.represent_id ? Number(formData.represent_id) : '',
          },
        };

        const res = await completeRegistration(data);

        if (res == undefined) {
          return;
        }

        Router.push('/clientes');
        resetValues();
      }
    } catch (error: any) {
      handleFormError(error);

      scroll.scrollToTop({
        duration: 500,
        smooth: 'easeInOutQuart',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
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
        value={formData[name]}
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
  ) => (
    <Flex style={{ flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {label}
      </Typography>
      <FormControl size="small">
        <InputLabel>{`Selecione ${label}`}</InputLabel>
        <Select
          name={name}
          label={`Selecione ${label}`}
          value={formData[name]}
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

  const handleCustomerChange = (name: any, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name as string]: value,
    }));
  };

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

  const handleBirthDate = (date: any) => {
    const birthDate = new Date(date).toLocaleDateString('pt-BR');
    setSelectedDate(date);
    setFormData((prevData: any) => ({
      ...prevData,
      ['birth']: birthDate,
    }));
  };

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        const name = attributes.name ? attributes.name : '';
        const last_name = attributes.last_name ? attributes.last_name : '';
        const cpf = attributes.cpf ? cpfMask(attributes.cpf) : '';
        const rg = attributes.rg ? rgMask(attributes.rg) : '';
        const gender = attributes.gender ? attributes.gender : '';
        const civil_status = attributes.civil_status ? attributes.civil_status : '';
        const nationality = attributes.nationality ? attributes.nationality : '';
        const birth = attributes.birth ? attributes.birth.split('-').reverse().join('/') : '';
        const represent_id =
          attributes.represent && attributes.represent.profile_customer_id
            ? attributes.represent.profile_customer_id
            : '';

        setFormData({
          name: name,
          represent_id: represent_id,
          last_name: last_name,
          CPF: cpf,
          RG: rg,
          gender: gender,
          civil_status: civil_status,
          nationality: nationality,
          birth: birth,
        });

        const phones =
          attributes.phones && attributes.phones.length > 0
            ? attributes.phones
            : [{ phone_number: '' }];

        const emails =
          attributes.emails && attributes.emails.length > 0 ? attributes.emails : [{ email: '' }];

        setContactData({
          phoneInputFields: phones,
          emailInputFields: emails,
        });

        if (attributes.birth) {
          setSelectedDate(dayjs(attributes.birth));
        }

        if (attributes.represent) {
          handleCustomerChange('represent_id', attributes.represent.profile_admin_id);

          const customer = adminsList.find(
            customer => customer.id == attributes.represent.profile_admin_id,
          );

          if (customer) {
            handleCustomerChange('represent_id', customer.id);
          }
        }
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm, adminsList]);

  useEffect(() => {
    const getAdmins = async () => {
      const response: {
        data: IAdminProps[];
      } = await getAllAdmins();

      if (response) {
        setAdminsList(response.data);
      }
    };

    getAdmins();
  }, []);

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
              <Flex>
                <Box width={'300px'}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {'Selecione o Representado'}
                  </Typography>
                </Box>
                <Box style={{ flex: 1 }}>
                  <Box width={'50%'} pr={'15.5px'}>
                    <Autocomplete
                      disablePortal={true}
                      autoComplete
                      options={adminsList}
                      getOptionLabel={option =>
                        option && option.attributes.name ? option.attributes.name : ''
                      }
                      onChange={(event, value) => {
                        if (value) {
                          handleCustomerChange('represent_id', value.id);
                        } else {
                          handleCustomerChange('represent_id', '');
                        }
                      }}
                      value={
                        formData.represent_id
                          ? adminsList.find(customer => customer.id == formData.represent_id)
                          : null
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          value={formData.represent_id}
                          placeholder="Selecione um Cliente"
                          size="small"
                        />
                      )}
                      noOptionsText="Nenhum Cliente Encontrado"
                    />
                  </Box>
                </Box>
              </Flex>

              <Divider />

              <Flex>
                <Box width={'300px'}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {'Dados do Representante'}
                  </Typography>
                </Box>

                <Flex style={{ gap: '16px', flexDirection: 'column', flex: 1 }}>
                  <Flex
                    style={{
                      flex: 1,
                      gap: '32px',
                    }}
                  >
                    {renderInputField('name', 'Nome', 'Nome do Representante')}
                    {renderInputField('last_name', 'Sobrenome', 'Sobrenome do Representante')}
                  </Flex>

                  <Flex style={{ gap: '32px' }}>
                    {renderInputField('CPF', 'CPF', 'Informe o CPF')}
                    {renderInputField('RG', 'RG', 'Informe o RG')}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <Flex style={{ flexDirection: 'column', flex: 1 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Flex>
                          <Typography mb={'8px'} variant="h6">
                            {'Data de Nascimento'}
                          </Typography>
                        </Flex>
                        <DatePicker
                          sx={{
                            '& .MuiInputBase-root': {
                              height: '40px',
                            },
                          }}
                          format="DD/MM/YYYY"
                          value={selectedDate}
                          onChange={handleBirthDate}
                        />
                      </LocalizationProvider>
                    </Flex>
                    {renderSelectField('Naturalidade', 'nationality', nationalityOptions)}
                  </Flex>

                  <Flex
                    style={{
                      flex: 1,
                      gap: '32px',
                    }}
                  >
                    {renderSelectField('Gênero', 'gender', gendersOptions)}
                    {renderSelectField('Estado Civil', 'civil_status', civilStatusOptions)}
                  </Flex>
                </Flex>
              </Flex>

              <Divider />

              <Flex>
                <Box width={'300px'}>
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
                          value={inputValue.email}
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

export default Representative;
