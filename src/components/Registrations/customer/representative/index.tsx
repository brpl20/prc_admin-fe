import { useState, ChangeEvent, useEffect, useContext } from 'react';
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
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { CustomerContext } from '@/contexts/CustomerContext';
import { gendersOptions, civilStatusOptions, nationalityOptions } from '@/utils/constants';
import { Container, Title } from './styles';
import { colors, ContentContainer, Flex, Divider } from '@/styles/globals';
import { phoneMask, cepMask, cpfMask } from '@/utils/masks';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  createProfileCustomer,
  getAllProfileCustomer,
  createCustomer as createCustomerApi,
  updateProfileCustomer,
} from '@/services/customers';
import { animateScroll as scroll } from 'react-scroll';
import Router, { useRouter } from 'next/router';
import { z } from 'zod';
import { ICustomerProps } from '@/interfaces/ICustomer';
import {
  isValidCEP,
  isValidCPF,
  isValidEmail,
  isValidPhoneNumber,
  isValidRG,
} from '@/utils/validator';

interface FormData {
  represent_id: string;
  profession: string;
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

interface Props {
  pageTitle: string;
}

export const representativeSchema = z.object({
  represent_id: z.string().min(1, { message: 'Selecione o Representado.' }),
  name: z.string().min(3, { message: 'Preencha o campo Nome.' }),
  last_name: z.string().min(3, { message: 'Preencha o campo Sobrenome.' }),
  CPF: z
    .string()
    .min(11, { message: 'O CPF precisa ter no mínimo 11 dígitos.' })
    .refine(isValidCPF, { message: 'O CPF informado é inválido.' }),
  RG: z
    .string()
    .min(6, { message: 'O RG precisa ter no mínimo 6 dígitos.' })
    .refine(isValidRG, { message: 'O RG informado é inválido.' }),
  gender: z.string().min(3, 'Gênero é obrigatório'),
  civil_status: z.string().min(1, 'Estado Civil é obrigatório'),
  nationality: z.string().min(1, 'Naturalidade é obrigatório'),
  phone_number: z
    .string({ required_error: 'Telefone é um campo obrigatório.' })
    .min(1, 'Telefone é um campo obrigatório.')
    .refine(isValidPhoneNumber, { message: 'Número de telefone inválido.' }),
  email: z
    .string({ required_error: 'E-mail é um campo obrigatório.' })
    .min(1, 'E-mail é um campo obrigatório.')
    .refine(isValidEmail, { message: 'E-mail inválido.' }),
  cep: z
    .string()
    .min(8, { message: 'O CEP precisa ter no mínimo 8 dígitos.' })
    .refine(isValidCEP, { message: 'O CEP informado é inválido.' }),
  street: z.string().min(4, { message: 'Preencha o campo Endereço.' }),
  number: z.string().min(1, { message: 'Preencha o campo Número.' }),
  description: z.string(),
  profession: z.string().min(1, { message: 'Preencha o campo Profissão.' }),
  neighborhood: z.string().min(4, { message: 'Preencha o campo Bairro.' }),
  city: z.string().min(4, { message: 'Preencha o campo Cidade.' }),
  state: z.string().min(1, { message: 'Preencha o campo Estado.' }),
});

const Representative = ({ pageTitle }: Props) => {
  const today = new Date().toISOString().split('T')[0];
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);

  const { customerForm } = useContext(CustomerContext);
  const { setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const currentDate = dayjs();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const route = useRouter();

  const [formData, setFormData] = useState<FormData>({
    represent_id: '',
    name: '',
    last_name: '',
    profession: '',
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
      profession: '',
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

  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'cep' ? cepMask(value) : value,
    }));
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
      const customer_data = await createCustomerApi(data_customer);

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
      representativeSchema.parse({
        represent_id: formData.represent_id,
        name: formData.name,
        last_name: formData.last_name,
        CPF: formData.CPF,
        RG: formData.RG,
        profession: formData.profession,
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

      const data = {
        capacity: 'able',
        profession: formData.profession,
        customer_type: 'representative',
        cpf: formData.CPF.replace(/\D/g, ''),
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
          representor_id: formData.represent_id ? Number(formData.represent_id) : '',
        },
        addresses_attributes: [
          {
            id: '',
            zip_code: formData.cep,
            street: formData.street,
            number: formData.number,
            description: formData.description,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
        ],
      };

      if (isEditing) {
        data.represent_attributes.representor_id = customerForm?.data?.attributes?.represent?.id;
        data.addresses_attributes[0].id = customerForm?.data?.attributes?.addresses[0]?.id ?? '';
        await updateProfileCustomer(customerForm.data.id, data);
      } else {
        await completeRegistration(data);
      }

      Router.push('/clientes');
      resetValues();
    } catch (error: any) {
      handleFormError(error);
      scroll.scrollToTop({ duration: 500, smooth: 'easeInOutQuart' });
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
    const errorObject: Record<string, string> = {};
    setMessage('Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);

    for (const field in newErrors) {
      if (newErrors.hasOwnProperty(field)) {
        errorObject[field] = newErrors[field][0] as string;
      }
    }
    setErrors(errorObject);
  };

  const handleCustomerChange = (name: string, value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    if (name) {
      setFormData(prevData => ({ ...prevData, [name]: value as string }));
    }
  };

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
      const attributes = customerForm.data.attributes;
      setFormData({
        represent_id: attributes.represent?.representor_id.toString() ?? '',
        name: attributes.name || '',
        last_name: attributes.last_name || '',
        CPF: cpfMask(attributes.cpf || ''),
        RG: attributes.rg || '',
        gender: attributes.gender || '',
        civil_status: attributes.civil_status || '',
        nationality: attributes.nationality || '',
        birth: attributes.birth || currentDate,
        profession: attributes.profession || '',
        cep: attributes.addresses[0]?.zip_code || '',
        street: attributes.addresses[0]?.street || '',
        number: attributes.addresses[0]?.number || '',
        description: attributes.addresses[0]?.description || '',
        neighborhood: attributes.addresses[0]?.neighborhood || '',
        city: attributes.addresses[0]?.city || '',
        state: attributes.addresses[0]?.state || '',
      });

      setContactData({
        phoneInputFields:
          attributes.phones && attributes.phones.length > 0
            ? attributes.phones
            : [{ phone_number: '' }],
        emailInputFields:
          attributes.emails && attributes.emails.length > 0 ? attributes.emails : [{ email: '' }],
      });
    }
  }, [customerForm]);

  useEffect(() => {
    const getAdmins = async () => {
      const response = await getAllProfileCustomer('');
      if (response) setCustomersList(response.data);
    };
    getAdmins();
  }, []);

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
    setPageTitle(`${route.asPath.includes('cadastrar') ? 'Cadastro' : 'Alterar'} de Representante`);
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
              <Flex>
                <Box width="300px">
                  <Typography variant="h6">Selecione o Representado</Typography>
                </Box>
                <Box flex={1}>
                  <Box width="50%" pr="15.5px">
                    <Autocomplete
                      disablePortal
                      autoComplete
                      options={customersList}
                      getOptionLabel={option => option?.attributes?.name ?? ''}
                      onChange={(event, value) =>
                        handleCustomerChange('represent_id', value?.id || '')
                      }
                      value={
                        customersList.find(customer => customer.id === formData.represent_id) ||
                        null
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
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
                <Box width="300px">
                  <Typography variant="h6">Dados do Representante</Typography>
                </Box>

                <Flex style={{ gap: '16px', flexDirection: 'column', flex: 1 }}>
                  <Flex style={{ flex: 1, gap: '32px' }}>
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
                          <Typography mb="8px" variant="h6">
                            Data de Nascimento
                          </Typography>
                        </Flex>
                        <input
                          type="date"
                          name="birth"
                          max={today}
                          value={formData.birth as string}
                          onChange={handleInputChange}
                          style={{
                            height: '40px',
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #c4c4c4',
                            fontSize: '16px',
                            fontFamily: 'Roboto',
                            fontWeight: 400,
                          }}
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

                  <Flex style={{ flex: 1, gap: '32px' }}>
                    {renderSelectField('Gênero', 'gender', gendersOptions, !!errors.gender)}
                    {renderSelectField(
                      'Estado Civil',
                      'civil_status',
                      civilStatusOptions,
                      !!errors.civil_status,
                    )}
                  </Flex>

                  <Flex style={{ gap: '32px' }}>
                    {renderInputField(
                      'profession',
                      'Profissão',
                      'Informe a Profissão',
                      !!errors.profession,
                    )}
                  </Flex>
                </Flex>
              </Flex>

              <Divider />

              <Flex>
                <Box width="300px">
                  <Typography variant="h6">Endereço</Typography>
                </Box>

                <Flex style={{ gap: '32px', flex: 1 }}>
                  <Box display="flex" flexDirection="column" gap="16px" flex={1}>
                    {renderInputField('cep', 'CEP', 'Informe o CEP', !!errors.cep)}
                    <Flex style={{ gap: '16px' }}>
                      {renderInputField(
                        'street',
                        'Endereço',
                        'Informe o Endereço',
                        !!errors.street,
                      )}
                      <Box maxWidth="30%">
                        {renderInputField('number', 'Número', 'N.º', !!errors.number)}
                      </Box>
                    </Flex>
                    {renderInputField('description', 'Complemento', 'Informe o Estado')}
                  </Box>
                  <Box display="flex" flexDirection="column" gap="16px" flex={1}>
                    {renderInputField(
                      'neighborhood',
                      'Bairro',
                      'Informe o Bairro',
                      !!errors.neighborhood,
                    )}
                    {renderInputField('city', 'Cidade', 'Informe a Cidade', !!errors.city)}
                    {renderInputField('state', 'Estado', 'Informe o Estado', !!errors.state)}
                  </Box>
                </Flex>
              </Flex>

              <Divider />

              <Flex>
                <Box width="300px">
                  <Typography variant="h6">Contato</Typography>
                </Box>

                <Flex style={{ gap: '32px', flex: 1 }}>
                  <Box flex={1}>
                    <Typography style={{ marginBottom: '8px' }} variant="h6">
                      Telefone
                    </Typography>

                    {contactData.phoneInputFields.map((inputValue, index) => (
                      <Flex
                        key={index}
                        style={{ flexDirection: 'column', marginBottom: '8px', gap: '6px' }}
                      >
                        <div className="flex flex-row gap-1">
                          <TextField
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
                      </Flex>
                    ))}
                  </Box>

                  <Box flex={1}>
                    <Typography style={{ marginBottom: '8px' }} variant="h6">
                      E-mail
                    </Typography>

                    {contactData.emailInputFields.map((inputValue, index) => (
                      <Flex
                        key={index}
                        style={{ flexDirection: 'column', marginBottom: '8px', gap: '6px' }}
                      >
                        <div className="flex flex-row gap-1">
                          <TextField
                            variant="outlined"
                            fullWidth
                            name="email"
                            size="small"
                            placeholder="Informe o Email"
                            value={inputValue.email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleContactChange(index, e.target.value, 'emailInputFields')
                            }
                            error={!!errors.email}
                            autoComplete="off"
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
                      </Flex>
                    ))}
                  </Box>
                </Flex>
              </Flex>
            </Box>
          </form>

          <Divider />

          <Box width="100%" display="flex" justifyContent="end" mt="16px">
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

export default Representative;
