import { useState, ChangeEvent, useEffect } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';

import { TextField, Box, Typography, Button, CircularProgress, Modal } from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';
import { getCEPDetails } from '@/services/brasilAPI';
import { cepMask, cpfMask, phoneMask } from '@/utils/masks';

import { gendersOptions, civilStatusOptions, nationalityOptions } from '@/utils/constants';

import { Container } from '../styles';
import { colors, ContentContainer } from '@/styles/globals';

import dayjs, { Dayjs } from 'dayjs';

import { Flex, Divider } from '@/styles/globals';
import { createProfileCustomer, createCustomer as createCustomerApi } from '@/services/customers';
import { animateScroll as scroll } from 'react-scroll';

import { IoMdTrash } from 'react-icons/io';
import { z } from 'zod';
import {
  isValidCEP,
  isValidCPF,
  isValidEmail,
  isValidPhoneNumber,
  isValidRG,
} from '@/utils/validator';
import { ZodFormError, ZodFormErrors } from '@/types/zod';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import CustomDateField from '@/components/FormInputFields/CustomDateField';
import CustomSelectField from '@/components/FormInputFields/CustomSelectField';

interface FormData {
  name: string;
  last_name: string;
  CPF: string;
  profession: string;
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
  isOpen: boolean;
  handleClose: () => void;
  handleRegistrationFinished: () => void;
}

const representativeSchema = z.object({
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
});

const currentDate = dayjs();

const initialFormData: FormData = {
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
};

const initialContactData = {
  phoneInputFields: [{ phone_number: '' }],
  emailInputFields: [{ email: '' }],
};

const RepresentativeModal = ({
  pageTitle,
  isOpen,
  handleClose,
  handleRegistrationFinished,
}: props) => {
  const [errors, setErrors] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [contactData, setContactData] = useState(initialContactData);

  const resetValues = () => {
    setFormData(initialFormData);
    setContactData(initialContactData);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (errors[name]) {
      delete errors[name];
      setErrors(errors);
    }
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

      if (inputArrayName === 'phoneInputFields') {
        if (newInputFields[index]) {
          newInputFields[index] = {
            ...newInputFields[index],
            phone_number: phoneMask(value),
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
      const data_customer = { customer: { email: data.emails_attributes[0].email } };
      const customer_data = await createCustomerApi(data_customer);

      if (!customer_data.data.attributes.email) throw new Error('E-mail já está em uso !');

      const customer_id = customer_data.data.id;
      const newData = { ...data, customer_id: Number(customer_id) };
      await createProfileCustomer(newData);

      handleClose();
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
        name: formData.name,
        last_name: formData.last_name,
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
        name: formData.name,
        last_name: formData.last_name,
        birth: formData.birth,
        civil_status: formData.civil_status,
        phones_attributes: contactData.phoneInputFields,
        emails_attributes: contactData.emailInputFields,

        addresses_attributes: [
          {
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

      const res = await completeRegistration(data);

      if (res == undefined) {
        return;
      }

      handleClose();
      resetValues();
    } catch (error: any) {
      handleFormError(error);

      scroll.scrollToTop({
        duration: 500,
        smooth: 'easeInOutQuart',
      });
    } finally {
      setLoading(false);
      handleRegistrationFinished();
    }
  };

  const handleFormError = (error: { issues: ZodFormError[] }) => {
    const newErrors = error.issues ?? [];
    setMessage('Corrija os erros no formulário.');
    setType('error');
    setOpenSnackbar(true);
    const result: ZodFormErrors = {};

    // Loop through the errors
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

    console.error(newErrors);
    setErrors(result);
  };

  const getErrorMessage = (index: number, field: string) => {
    if (errors[field] && errors[field][index]) {
      const error = errors[field][index];
      return error;
    }
    return null;
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

  useEffect(() => {
    if (pageTitle.search('terar') !== -1) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [pageTitle]);

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

    if (formData.cep) {
      fetchCEPDetails();
    }
  }, [formData.cep]);

  const handleRemoveContact = (removeIndex: number, inputArrayName: string) => {
    if (inputArrayName === 'phoneInputFields') {
      if (contactData.phoneInputFields.length === 1) return;

      const updatedEducationals = [...contactData.phoneInputFields];
      updatedEducationals.splice(removeIndex, 1);
      setContactData(prevData => ({
        ...prevData,
        phoneInputFields: updatedEducationals,
      }));
    }

    if (inputArrayName === 'emailInputFields') {
      if (contactData.emailInputFields.length === 1) return;

      const updatedEducationals = [...contactData.emailInputFields];
      updatedEducationals.splice(removeIndex, 1);
      setContactData(prevData => ({
        ...prevData,
        emailInputFields: updatedEducationals,
      }));
    }
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

      <Modal open={isOpen} style={{ overflowY: 'auto', marginLeft: 'auto' }}>
        <Container
          style={{
            marginLeft: '84px',
            borderRadius: '4px',
          }}
        >
          <ContentContainer>
            <form>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
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
                        label={'Data de Nascimento'}
                        name={'birth'}
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
                  <Box width={'300px'}>
                    <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                      {'Endereço'}
                    </Typography>
                  </Box>

                  <Flex style={{ gap: '32px', flex: 1 }}>
                    <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
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
                        <Box maxWidth={'30%'}>
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
                    <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
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

                <Flex>
                  <Box width={'300px'}>
                    <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                      {'Contato'}
                    </Typography>
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
                  handleClose();
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
      </Modal>
    </>
  );
};

export default RepresentativeModal;
