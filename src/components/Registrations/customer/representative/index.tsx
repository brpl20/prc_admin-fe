import { useState, ChangeEvent, useEffect, useContext } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { IoMdTrash } from 'react-icons/io';

import { TextField, Box, Typography, Button, Autocomplete, CircularProgress } from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { CustomerContext } from '@/contexts/CustomerContext';
import { gendersOptions, civilStatusOptions, nationalityOptions } from '@/utils/constants';
import { Container, Title } from './styles';
import { colors, ContentContainer, Flex, Divider } from '@/styles/globals';
import { phoneMask, cepMask, cpfMask } from '@/utils/masks';
import dayjs from 'dayjs';
import {
  createProfileCustomer,
  getAllProfileCustomer,
  createCustomer as createCustomerApi,
  updateProfileCustomer,
} from '@/services/customers';
import { animateScroll as scroll } from 'react-scroll';
import Router, { useRouter } from 'next/router';
import { z } from 'zod';
import { IProfileCustomer } from '@/interfaces/ICustomer';
import {
  isDateBeforeToday,
  isValidCEP,
  isValidCPF,
  isValidEmail,
  isValidPhoneNumber,
  isValidRG,
} from '@/utils/validator';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import CustomSelectField from '@/components/FormInputFields/CustomSelectField';
import CustomDateField from '@/components/FormInputFields/CustomDateField';
import { ZodFormError, ZodFormErrors } from '@/types/zod';
import { getProfileCustomerFullName } from '@/utils/profileCustomerUtils';

interface FormData {
  represent_id?: string;
  profession: string;
  name: string;
  last_name: string;
  CPF: string;
  RG: string;
  gender: string;
  civil_status: string;
  nationality: string;
  birth: string;
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
  name: z.string().min(3, { message: 'Preencha o campo Nome.' }),
  last_name: z.string().min(3, { message: 'Preencha o campo Sobrenome.' }),
  CPF: z
    .string()
    .min(11, { message: 'O CPF precisa ter no mínimo 11 dígitos.' })
    .refine(isValidCPF, { message: 'O CPF informado é inválido.' }),
  RG: z
    .string()
    .min(1, { message: 'RG é um campo obrigatório.' })
    .refine(isValidRG, { message: 'O RG informado é inválido.' }),
  gender: z.string().min(3, 'Gênero é obrigatório'),
  civil_status: z.string().min(1, 'Estado Civil é obrigatório'),
  nationality: z.string().min(1, 'Naturalidade é obrigatório'),
  phone_numbers: z.array(
    z
      .string({ required_error: 'Telefone é um campo obrigatório.' })
      .min(1, 'Telefone é um campo obrigatório.')
      .refine(isValidPhoneNumber, { message: 'Número de telefone inválido.' }),
  ),
  emails: z.array(
    z
      .string({ required_error: 'E-mail é um campo obrigatório.' })
      .min(1, 'E-mail é um campo obrigatório.')
      .refine(isValidEmail, { message: 'E-mail inválido.' }),
  ),
  cep: z
    .string()
    .min(8, { message: 'O CEP precisa ter no mínimo 8 dígitos.' })
    .refine(isValidCEP, { message: 'O CEP informado é inválido.' }),
  street: z.string().min(4, { message: 'Preencha o campo Endereço.' }),
  number: z.coerce.string().min(2, { message: 'Número é um campo obrigatório' }),
  description: z.string(),
  profession: z.string().min(1, { message: 'Preencha o campo Profissão.' }),
  neighborhood: z.string().min(4, { message: 'Preencha o campo Bairro.' }),
  city: z.string().min(4, { message: 'Preencha o campo Cidade.' }),
  state: z.string().min(1, { message: 'Preencha o campo Estado.' }),
  birth: z
    .string()
    .min(10, { message: 'Data de Nascimento inválida.' })
    .refine(isDateBeforeToday, { message: 'Data de Nascimento inválida.' }),
});

const Representative = ({ pageTitle }: Props) => {
  const today = new Date().toISOString().split('T')[0];
  const [errors, setErrors] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customersList, setCustomersList] = useState<IProfileCustomer[]>([]);

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
    birth: today,
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
      birth: today,
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

    const formattedValue =
      name === 'CPF' ? cpfMask(value) : name === 'cep' ? cepMask(value) : value;

    setFormData(prevData => ({
      ...prevData,
      [name]: formattedValue,
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

      if (!customer_data.data.attributes.access_email) throw new Error('E-mail já está em uso !');

      const customer_id = customer_data.data.id;
      const newData = { ...data, customer_id: Number(customer_id) };
      await createProfileCustomer(newData);

      Router.push('/clientes');
      resetValues();
    } catch (error: any) {
      setErrors({});
      const message =
        error?.response?.data?.errors?.[0]?.code?.[0] || 'Ocorreu um erro inesperado.';
      setMessage(message);
      setType('error');
      setOpenSnackbar(true);
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
        birth: formData.birth,
        CPF: formData.CPF,
        RG: formData.RG,
        profession: formData.profession,
        gender: formData.gender,
        nationality: formData.nationality,
        civil_status: formData.civil_status,
        phone_numbers: contactData.phoneInputFields.map(field => field.phone_number),
        emails: contactData.emailInputFields.map(field => field.email),
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
        name: formData.name.trim(),
        last_name: formData.last_name.trim(),
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
        data.represent_attributes.representor_id =
          customerForm?.data?.attributes?.represent?.representor_id;
        data.addresses_attributes[0].id = customerForm?.data?.attributes?.addresses[0]?.id ?? '';
        await updateProfileCustomer(customerForm.data.id, data);
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
    } catch (error: any) {
      handleFormError(error);
      scroll.scrollToTop({ duration: 500, smooth: 'easeInOutQuart' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = (error: { issues: ZodFormError[] }) => {
    const newErrors = error.issues ?? [];
    setMessage('Corrija os erros no formulário.');
    setType('error');
    setOpenSnackbar(true);
    const result: ZodFormErrors = {};

    // Loop through the errors and process them
    newErrors.forEach(err => {
      let [field, index] = err.path;

      index = index || 0;

      if (!result[field]) {
        result[field] = []; // Initialize array for the field if not present
      }

      // If there's no error for this index, add it
      if (!result[field][index as number]) {
        result[field][index as number] = err.message; // Store only the first error for this index
      }
    });

    setErrors(result);
  };

  const getErrorMessage = (index: number, field: string) => {
    if (errors[field] && errors[field][index]) {
      const error = errors[field][index];
      return error;
    }
    return null;
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
      if (response) {
        // Sort customersList by full name
        const sortedList = response.data.sort((a: IProfileCustomer, b: IProfileCustomer) => {
          const nameA = getProfileCustomerFullName(a).toLowerCase();
          const nameB = getProfileCustomerFullName(b).toLowerCase();
          return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'variant' });
        });
        setCustomersList(sortedList);
      }
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
                      getOptionLabel={option =>
                        option &&
                        option.attributes &&
                        `${option.id} - ${getProfileCustomerFullName(option)}`
                      }
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
                          helperText={errors.represent_id}
                          FormHelperTextProps={{ className: 'ml-2' }}
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
                    <CustomTextField
                      formData={formData}
                      name="name"
                      label="Nome do Representante"
                      errorMessage={getErrorMessage(0, 'name')}
                      handleInputChange={handleInputChange}
                    />
                    <CustomTextField
                      formData={formData}
                      name="last_name"
                      label="Sobrenome do Representante"
                      errorMessage={getErrorMessage(0, 'last_name')}
                      handleInputChange={handleInputChange}
                    />
                  </Flex>

                  <Flex style={{ gap: '32px' }}>
                    <CustomTextField
                      formData={formData}
                      name="CPF"
                      label="CPF"
                      errorMessage={getErrorMessage(0, 'CPF')}
                      handleInputChange={handleInputChange}
                    />
                    <CustomTextField
                      formData={formData}
                      name="RG"
                      label="RG"
                      errorMessage={getErrorMessage(0, 'RG')}
                      handleInputChange={handleInputChange}
                    />
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <CustomDateField
                      formData={formData}
                      name={'birth'}
                      label={'Data de Nascimento'}
                      errorMessage={getErrorMessage(0, 'birth')}
                      handleInputChange={handleInputChange}
                    />
                    <CustomSelectField
                      formData={formData}
                      name="nationality"
                      label="Naturalidade"
                      errorMessage={getErrorMessage(0, 'nationality')}
                      options={nationalityOptions}
                      handleSelectChange={handleSelectChange}
                    />
                  </Flex>

                  <Flex style={{ flex: 1, gap: '32px' }}>
                    <CustomSelectField
                      formData={formData}
                      name="gender"
                      label="Gênero"
                      errorMessage={getErrorMessage(0, 'gender')}
                      options={gendersOptions}
                      handleSelectChange={handleSelectChange}
                    />
                    <CustomSelectField
                      formData={formData}
                      name="civil_status"
                      label="Estado Civil"
                      errorMessage={getErrorMessage(0, 'civil_status')}
                      options={civilStatusOptions}
                      handleSelectChange={handleSelectChange}
                    />
                  </Flex>

                  <Flex style={{ gap: '32px' }}>
                    <CustomTextField
                      formData={formData}
                      name="profession"
                      label="Profissão"
                      errorMessage={getErrorMessage(0, 'profession')}
                      handleInputChange={handleInputChange}
                    />
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
                    <CustomTextField
                      formData={formData}
                      name="cep"
                      label="CEP"
                      errorMessage={getErrorMessage(0, 'cep')}
                      handleInputChange={handleInputChange}
                    />
                    <Flex style={{ gap: '16px' }}>
                      <CustomTextField
                        formData={formData}
                        name="street"
                        label="Endereço"
                        errorMessage={getErrorMessage(0, 'street')}
                        handleInputChange={handleInputChange}
                      />

                      <Box maxWidth="30%">
                        <CustomTextField
                          formData={formData}
                          name="number"
                          label="Número"
                          placeholder="N.º"
                          errorMessage={getErrorMessage(0, 'number')}
                          handleInputChange={handleInputChange}
                        />
                      </Box>
                    </Flex>
                    <CustomTextField
                      formData={formData}
                      name="description"
                      label="Complemento"
                      errorMessage={getErrorMessage(0, 'description')}
                      handleInputChange={handleInputChange}
                    />
                  </Box>
                  <Box display="flex" flexDirection="column" gap="16px" flex={1}>
                    <CustomTextField
                      formData={formData}
                      name="neighborhood"
                      label="Bairro"
                      errorMessage={getErrorMessage(0, 'neighborhood')}
                      handleInputChange={handleInputChange}
                    />

                    <CustomTextField
                      formData={formData}
                      name="city"
                      label="Cidade"
                      errorMessage={getErrorMessage(0, 'city')}
                      handleInputChange={handleInputChange}
                    />

                    <CustomTextField
                      formData={formData}
                      name="state"
                      label="Estado"
                      errorMessage={getErrorMessage(0, 'state')}
                      handleInputChange={handleInputChange}
                    />
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
                          <CustomTextField
                            customValue={inputValue.phone_number || ''}
                            formData={formData}
                            name="phone"
                            placeholder="Informe o Telefone"
                            handleInputChange={(e: any) =>
                              handleContactChange(index, e.target.value, 'phoneInputFields')
                            }
                            errorMessage={getErrorMessage(index, 'phone_numbers')}
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
                          <button
                            id="add-phone"
                            type="button"
                            className="flex items-center w-fit self-end"
                            onClick={() => handleAddInput('phoneInputFields')}
                          >
                            <IoAddCircleOutline
                              className={`cursor-pointer ml-auto ${
                                contactData.phoneInputFields.length > 1 ? 'mr-6' : ''
                              }`}
                              color={colors.quartiary}
                              size={20}
                            />
                          </button>
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
                          <CustomTextField
                            customValue={inputValue.email || ''}
                            formData={formData}
                            name="email"
                            placeholder="Informe o E-mail"
                            handleInputChange={(e: any) =>
                              handleContactChange(index, e.target.value, 'emailInputFields')
                            }
                            errorMessage={getErrorMessage(index, 'emails')}
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
                          <button
                            id="add-email"
                            type="button"
                            className="flex items-center w-fit self-end"
                            onClick={() => handleAddInput('emailInputFields')}
                          >
                            <IoAddCircleOutline
                              className={`cursor-pointer ml-auto ${
                                contactData.emailInputFields.length > 1 ? 'mr-6' : ''
                              }`}
                              color={colors.quartiary}
                              size={20}
                            />
                          </button>
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
