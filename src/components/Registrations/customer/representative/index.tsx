import { useState, ChangeEvent, useEffect, useContext } from 'react';
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
  CircularProgress,
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
import { cepMask, cpfMask } from '@/utils/masks';
import { z } from 'zod';
import { ICustomerProps } from '@/interfaces/ICustomer';

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
  cep: string;
  street: string;
  number: string;
  description: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface props {
  pageTitle: string;
}

const representativeSchema = z.object({
  represent_id: z.string().nonempty({ message: 'Selecione o Representado.' }),
  name: z.string().nonempty({ message: 'Preencha o campo Nome.' }),
  last_name: z.string().nonempty({ message: 'Preencha o campo Sobrenome.' }),
  CPF: z.string().nonempty({ message: 'Preencha o campo CPF.' }),
  RG: z.string().nonempty({ message: 'Preencha o campo RG.' }),
  gender: z.string().nonempty('Gênero é obrigatório'),
  civil_status: z.string().nonempty('Estado Civil é obrigatório'),
  nationality: z.string().nonempty('Naturalidade é obrigatório'),
  phone_number: z.string().nonempty('Telefone Obrigatório'),
  email: z.string().nonempty('Email Obrigatório'),
  cep: z.string().nonempty({ message: 'Preencha o campo CEP.' }),
  street: z.string().nonempty({ message: 'Preencha o campo Endereço.' }),
  number: z.string().nonempty({ message: 'Preencha o campo Número.' }),
  description: z.string(),
  neighborhood: z.string().nonempty({ message: 'Preencha o campo Bairro.' }),
  city: z.string().nonempty({ message: 'Preencha o campo Cidade.' }),
  state: z.string().nonempty({ message: 'Preencha o campo Estado.' }),
});

const Representative = ({ pageTitle }: props) => {
  const [errors, setErrors] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);

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
    cep: '',
    street: '',
    number: '',
    description: '',
    neighborhood: '',
    city: '',
    state: '',
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
      cep: '',
      street: '',
      number: '',
      description: '',
      neighborhood: '',
      city: '',
      state: '',
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

    if (name === 'cep') {
      setFormData(prevData => ({
        ...prevData,
        [name]: cepMask(value),
      }));
      return;
    }

    if (name === 'CPF') {
      setFormData(prevData => ({
        ...prevData,
        CPF: cpfMask(value),
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
      handleFormError(error);

      scroll.scrollToTop({
        duration: 500,
        smooth: 'easeInOutQuart',
      });
    }
  };

  const handleSubmitForm = async () => {
    setLoading(true);

    try {
      representativeSchema.parse({
        represent_id: formData.represent_id,
        name: formData.name,
        last_name: formData.last_name,
        CPF: formData.CPF,
        RG: formData.RG,
        gender: formData.gender,
        nationality: formData.nationality,
        civil_status: formData.civil_status,
        phone_number: contactData.phoneInputFields[0].phone_number,
        email: contactData.emailInputFields[0].email,
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        description: formData.description,
      });

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
            id: customerForm?.data?.attributes?.represent?.id,
            representor_id: formData.represent_id ? Number(formData.represent_id) : '',
          },
          addresses_attributes: [
            {
              id: customerForm?.data?.attributes?.addresses[0]?.id ?? '',
              zip_code: formData.cep.replace(/\D/g, ''),
              street: formData.street,
              number: formData.number,
              description: formData.description,
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state,
            },
          ],
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
            representor_id: formData.represent_id ? Number(formData.represent_id) : '',
          },
          addresses_attributes: [
            {
              zip_code: formData.cep.replace(/\D/g, ''),
              street: formData.street,
              number: formData.number,
              description: formData.description,
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state,
            },
          ],
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
    const errorCode = error?.response?.data?.errors[0]?.code;
    if (errorCode) {
      setMessage(errorCode);
      setType('error');
      setOpenSnackbar(true);
      return;
    }

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
    error?: boolean,
  ) => (
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
        error={error}
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
        <InputLabel>{`Selecione ${label}`}</InputLabel>
        <Select
          name={name}
          label={`Selecione ${label}`}
          value={formData[name]}
          onChange={handleSelectChange}
          error={error}
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
        const rg = attributes.rg ? attributes.rg : '';
        const gender = attributes.gender ? attributes.gender : '';
        const civil_status = attributes.civil_status ? attributes.civil_status : '';
        const nationality = attributes.nationality ? attributes.nationality : '';
        const birth = attributes.birth ? attributes.birth.split('-').reverse().join('/') : '';
        const represent_id = attributes.represent?.representor_id.toString() ?? '';

        setFormData({
          name: name,
          represent_id: represent_id.toString(),
          last_name: last_name,
          CPF: cpf,
          RG: rg,
          gender: gender,
          civil_status: civil_status,
          nationality: nationality,
          birth: birth,
          cep: attributes.addresses[0]?.zip_code ?? '',
          street: attributes.addresses[0]?.street ?? '',
          number: attributes.addresses[0]?.number ?? '',
          description: attributes.addresses[0]?.description ?? '',
          neighborhood: attributes.addresses[0]?.neighborhood ?? '',
          city: attributes.addresses[0]?.city ?? '',
          state: attributes.addresses[0]?.state ?? '',
        });

        setContactData({
          phoneInputFields:
            attributes.phones && attributes.phones.length > 0
              ? attributes.phones
              : [{ phone_number: '' }],
          emailInputFields:
            attributes.emails && attributes.emails.length > 0 ? attributes.emails : [{ email: '' }],
        });

        if (attributes.birth) {
          setSelectedDate(dayjs(attributes.birth));
        }

        if (attributes.represent) {
          handleCustomerChange(
            'represent_id',
            attributes.represent.representor_id.toString() ?? '',
          );
        }
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm, customersList]);

  useEffect(() => {
    const getAdmins = async () => {
      const response: {
        data: ICustomerProps[];
      } = await getAllCustomers();

      if (response) {
        setCustomersList(response.data);
      }
    };

    getAdmins();
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
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

  useEffect(() => {
    setPageTitle(`${route.asPath.includes('cadastrar') ? 'Cadastro' : 'Alterar'} de Representante`);
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
                      options={customersList}
                      getOptionLabel={option => option?.attributes?.name ?? ''}
                      onChange={(event, value) => {
                        if (value) {
                          handleCustomerChange('represent_id', value.id);
                        } else {
                          handleCustomerChange('represent_id', '');
                        }
                      }}
                      value={
                        formData.represent_id
                          ? customersList.find(customer => customer.id == formData.represent_id)
                          : null
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          value={formData.represent_id}
                          placeholder="Selecione um Cliente"
                          size="small"
                          error={!!errors.represent_id}
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
                    {renderInputField('name', 'Nome', 'Nome do Representante', !!errors.name)}
                    {renderInputField(
                      'last_name',
                      'Sobrenome',
                      'Sobrenome do Representante',
                      !!errors.last_name,
                    )}
                  </Flex>

                  <Flex style={{ gap: '32px' }}>
                    {renderInputField('CPF', 'CPF', 'Informe o CPF', !!errors.CPF)}
                    {renderInputField('RG', 'RG', 'Informe o RG', !!errors.RG)}
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
                    {renderSelectField(
                      'Naturalidade',
                      'nationality',
                      nationalityOptions,
                      !!errors.nationality,
                    )}
                  </Flex>

                  <Flex
                    style={{
                      flex: 1,
                      gap: '32px',
                    }}
                  >
                    {renderSelectField('Gênero', 'gender', gendersOptions, !!errors.gender)}
                    {renderSelectField(
                      'Estado Civil',
                      'civil_status',
                      civilStatusOptions,
                      !!errors.civil_status,
                    )}
                  </Flex>
                </Flex>
              </Flex>

              <Divider />

              <Flex>
                <Box width={'300px'}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {'Endereço'}
                  </Typography>
                </Box>

                <Flex style={{ gap: '32px', flex: 1 }}>
                  <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                    {renderInputField('cep', 'CEP', 'Informe o CEP', !!errors.cep)}
                    <Flex style={{ gap: '16px' }}>
                      {renderInputField(
                        'street',
                        'Endereço',
                        'Informe o Endereço',

                        !!errors.street,
                      )}
                      <Box maxWidth={'30%'}>
                        {renderInputField('number', 'Número', 'N.º', !!errors.number)}
                      </Box>
                    </Flex>
                    {renderInputField('description', 'Complemento', 'Informe o Estado')}
                  </Box>
                  <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                    {renderInputField(
                      'neighborhood',
                      'Bairro',
                      'Informe o Estado',
                      !!errors.neighborhood,
                    )}
                    {renderInputField('city', 'Cidade', 'Informe a Cidade', !!errors.city)}
                    {renderInputField('state', 'Estado', 'Informe o Estado', !!errors.state)}
                  </Box>
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
                          error={!!errors.phone_number}
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
                          error={!!errors.email}
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
                handleSubmitForm();
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: colors.white }} /> : 'Salvar'}
            </Button>
          </Box>
        </ContentContainer>
      </Container>
    </>
  );
};

export default Representative;
