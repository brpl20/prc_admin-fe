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
import { accountingType, societyType } from '@/utils/constants';

import { Container, Title, DateContainer } from './styles';
import { colors, ContentContainer } from '@/styles/globals';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Flex, Divider } from '@/styles/globals';
import { IoMdTrash } from 'react-icons/io';

import { getAllOfficeTypes } from '@/services/offices';
import { getAllBanks, getCEPDetails } from '@/services/brasilAPI';
import { createOffice, updateOffice } from '@/services/offices';

import Router, { useRouter } from 'next/router';
import { cepMask, cnpjMask } from '@/utils/masks';

import { IProfileAdmin, IProfileAdminAttributes } from '@/interfaces/IAdmin';
import { getAllProfileAdmins } from '@/services/admins';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import {
  isDateBeforeToday,
  isDateTodayOrBefore,
  isValidEmail,
  isValidPhoneNumber,
} from '@/utils/validator';
import { ZodFormError, ZodFormErrors } from '@/types/zod';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import CustomSelectField from '@/components/FormInputFields/CustomSelectField';
import CustomDateField from '@/components/FormInputFields/CustomDateField';

interface FormData {
  name: string;
  office_type: string;
  oab: string;
  cnpj_cpf: string;
  society_type: string;
  foundation_date: string;
  cep: string;
  address: string;
  state: string;
  city: string;
  number: string;
  description: string;
  neighborhood: string;
  webSite: string;
  responsible_lawyer: string;
  accounting_type: string;
  bank_name: string;
  agency: string;
  operation: string;
  account: string;
  pix: string;
}

interface props {
  dataToEdit?: any;
}

const officeSchema = z.object({
  name: z.string().min(2, { message: 'Nome do Escritório é um campo obrigatório.' }),
  office_type: z.string().min(1, { message: 'Tipo de Escritório é um campo obrigatório.' }),
  oab: z.string().min(2, { message: 'Identificador OAB é um campo obrigatório.' }),
  cnpj_cpf: z.string().min(2, { message: 'CNPJ é um campo obrigatório.' }),
  society_type: z.string().min(2, { message: 'Tipo de Sociedade é um campo obrigatório.' }),
  cep: z.string().min(2, { message: 'CEP é um campo obrigatório.' }),
  address: z.string().min(2, { message: 'Endereço é um campo obrigatório.' }),
  state: z.string().min(2, { message: 'Estado é um campo obrigatório.' }),
  city: z.string().min(2, { message: 'Cidade é um campo obrigatório.' }),
  number: z.string().min(2, { message: 'Número é um campo obrigatório.' }),
  neighborhood: z.string().min(2, { message: 'Bairro é um campo obrigatório.' }),
  accounting_type: z.string().min(2, { message: 'Enquadramento Contábil é um campo obrigatório.' }),
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
  foundation_date: z
    .string()
    .min(2, { message: 'Data de Função Exp. OAB é um campo obrigatório.' })
    .refine(isDateTodayOrBefore, { message: 'Data de Função Exp. OAB inválida.' }),
});

const Office = ({ dataToEdit }: props) => {
  const route = useRouter();

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [adminsList, setAdminsList] = useState<IProfileAdminAttributes[]>([]);
  const [officeTypes, setOfficeTypes] = useState<any[]>([]);
  const [selectedOfficeType, setSelectedOfficeType] = useState<any>({});
  const [selectedSocialType, setSelectedSocialType] = useState<any>({});
  const [bankList, setBankList] = useState([] as any[]);

  const { setShowTitle, setPageTitle, pageTitle } = useContext(PageTitleContext);

  const currentDate = dayjs();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({} as any);
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    office_type: '',
    oab: '',
    cnpj_cpf: '',
    society_type: '',
    foundation_date: '',
    cep: '',
    address: '',
    state: '',
    city: '',
    number: '',
    description: '',
    neighborhood: '',
    webSite: '',
    responsible_lawyer: '',
    accounting_type: '',
    bank_name: '',
    agency: '',
    operation: '',
    account: '',
    pix: '',
  });
  const [contactData, setContactData] = useState({
    phoneInputFields: [{ phone_number: '' }],
    emailInputFields: [{ email: '' }],
  });

  const resetValues = () => {
    setFormData({
      name: '',
      office_type: '',
      oab: '',
      cnpj_cpf: '',
      society_type: '',
      foundation_date: '',
      cep: '',
      address: '',
      state: '',
      city: '',
      number: '',
      description: '',
      neighborhood: '',
      webSite: '',
      responsible_lawyer: '',
      accounting_type: '',
      bank_name: '',
      agency: '',
      operation: '',
      account: '',
      pix: '',
    } as FormData);
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

    if (name === 'agency' || name === 'account' || name === 'op') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value.replace(/\D/g, ''),
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
        newInputFields[index] = { phone_number: value };
      } else if (inputArrayName === 'emailInputFields') {
        newInputFields[index] = { email: value };
      }

      return {
        ...prevData,
        [inputArrayName]: newInputFields,
      };
    });
  };

  const handleSubmitForm = async () => {
    setLoading(true);
    try {
      officeSchema.parse({
        name: formData.name,
        office_type: selectedOfficeType.id || '',
        oab: formData.oab,
        cnpj_cpf: formData.cnpj_cpf,
        society_type: formData.society_type,
        cep: formData.cep,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        number: formData.number.toString(),
        neighborhood: formData.neighborhood,
        foundation_date: formData.foundation_date,
        accounting_type: formData.accounting_type,
        phone_numbers: contactData.phoneInputFields.map(field => field.phone_number),
        emails: contactData.emailInputFields.map(field => field.email),
      });

      const office = {
        name: formData.name.trim(),
        cnpj: formData.cnpj_cpf.replace(/\D/g, ''),
        oab: formData.oab,
        society: selectedSocialType,
        foundation: formData.foundation_date
          ? formData.foundation_date.split('/').reverse().join('-')
          : '',
        site: formData.webSite,
        cep: formData.cep,
        street: formData.address,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        office_type_id: selectedOfficeType.id,
        responsible_lawyer_id: Number(formData.responsible_lawyer),
        accounting_type: formData.accounting_type,

        emails_attributes: contactData.emailInputFields,
        phones_attributes: contactData.phoneInputFields,

        bank_accounts_attributes: [
          {
            bank_name: formData.bank_name,
            agency: formData.agency,
            account: formData.account,
            pix: formData.pix,
            operation: formData.operation,
          },
        ],
      };

      if (isEditing) {
        await updateOffice(dataToEdit.id, {
          ...office,
          bank_accounts_attributes: [
            {
              ...office.bank_accounts_attributes[0],
              id: dataToEdit.attributes.bank_accounts[0]?.id,
            },
          ],
        });
        Router.push('/escritorios');

        return;
      } else {
        await createOffice(office);
        Router.push('/escritorios');
      }
    } catch (err: any) {
      handleFormError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;

    if (name === 'society_type') {
      setSelectedSocialType(value as string);
    }

    setFormData(prevData => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const handleResponsibleChange = (field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [field as string]: value ? value.id : '',
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

  const getAdmins = async () => {
    const response = await getAllProfileAdmins('');
    setAdminsList(response.data);
  };

  const getOfficeTypes = async () => {
    const response = await getAllOfficeTypes();
    setOfficeTypes(response.data);
  };

  const handleBankChange = (value: any) => {
    if (value) {
      setFormData(prevData => ({
        ...prevData,
        bank_name: value.name,
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        bank_name: '',
      }));
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
    getAdmins();

    getOfficeTypes();
  }, []);

  useEffect(() => {
    const getBanks = async () => {
      try {
        const response = await getAllBanks();
        const uniqueBanks = removeDuplicateBanks(response);
        const filteredBanks = uniqueBanks.filter(
          bank => bank.name !== 'Selic' && bank.name !== 'Bacen',
        );
        setBankList(filteredBanks);
      } catch (error: any) {}
    };

    const removeDuplicateBanks = (banks: any) => {
      const uniqueBanks = [];
      const keysSet = new Set();

      for (const bank of banks) {
        const { code, fullName, ispb, name } = bank;
        const key = `${code}-${fullName}-${ispb}-${name}`;

        if (!keysSet.has(key)) {
          keysSet.add(key);
          uniqueBanks.push(bank);
        }
      }

      return uniqueBanks;
    };
    getBanks();
  }, []);

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
    if (pageTitle.search('terar') !== -1) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [pageTitle]);

  useEffect(() => {
    const handleDataForm = () => {
      const form = dataToEdit.attributes;

      if (form) {
        setFormData(prevData => ({
          ...prevData,
          name: form.name,
          oab: form.oab,
          cnpj_cpf: form.cnpj,
          society_type: form.society,
          foundation_date: form.foundation,
          cep: form.cep,
          address: form.street,
          state: form.state,
          city: form.city,
          number: form.number,
          description: form.description,
          webSite: form.site,
          neighborhood: form.neighborhood,
          responsible_lawyer: form.responsible_lawyer_id,
          accounting_type: form.accounting_type,
          bank_name: form.bank_accounts[0]?.bank_name,
          agency: form.bank_accounts[0]?.agency,
          operation: form.bank_accounts[0]?.operation,
          account: form.bank_accounts[0]?.account,
          pix: form.bank_accounts[0]?.pix,
        }));

        const office = officeTypes.find(
          (office: any) => office.attributes.description === form.office_type_description,
        );

        setSelectedOfficeType(office);

        const foundation_date = form.foundation ? dayjs(form.foundation) : dayjs();

        setSelectedDate(foundation_date);

        if (form.phones.length > 0) {
          setContactData(prevData => ({
            ...prevData,
            phoneInputFields: form.phones,
          }));
        }

        if (form.emails.length > 0) {
          setContactData(prevData => ({
            ...prevData,
            emailInputFields: form.emails,
          }));
        }
      }
    };

    if (dataToEdit) {
      if (dataToEdit.id) {
        handleDataForm();
      }
    }
  }, [dataToEdit, adminsList, officeTypes, bankList]);

  useEffect(() => {
    setPageTitle(`${route.asPath.includes('cadastrar') ? 'Cadastro de ' : 'Alterar'} Escritório`);
  }, [route, setPageTitle]);

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
            <Flex>
              <Box width={'300px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Informação Sobre o Tipo'}
                </Typography>
              </Box>

              <Box style={{ flex: 1 }}>
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  gap={'16px'}
                  style={{
                    flex: 1,
                  }}
                >
                  <Flex style={{ gap: '24px', flex: 1 }}>
                    <Autocomplete
                      options={officeTypes}
                      value={selectedOfficeType}
                      getOptionLabel={option =>
                        option && option.attributes ? option.attributes.description : ''
                      }
                      renderInput={params => (
                        <TextField
                          value={
                            selectedOfficeType && selectedOfficeType.attributes
                              ? selectedOfficeType.attributes.description
                              : ''
                          }
                          placeholder="Selecione o Tipo de Escritório"
                          {...params}
                          size="small"
                          error={!!errors.office_type}
                          helperText={errors.office_type}
                          FormHelperTextProps={{ className: 'ml-2' }}
                        />
                      )}
                      sx={{ backgroundColor: 'white', zIndex: 1, width: '49%' }}
                      noOptionsText="Não Encontrado"
                      onChange={(event, value) => {
                        value ? setSelectedOfficeType(value) : setSelectedOfficeType('');
                      }}
                    />
                  </Flex>
                </Box>
              </Box>
            </Flex>

            <Divider />

            <Flex>
              <Box width={'300px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Identificação do Escritório'}
                </Typography>
              </Box>

              <Box style={{ flex: 1 }}>
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  gap={'16px'}
                  style={{
                    flex: 1,
                  }}
                >
                  <Flex style={{ gap: '24px' }}>
                    <CustomTextField
                      formData={formData}
                      label="Nome do Escritório"
                      name="name"
                      errorMessage={getErrorMessage(0, 'name')}
                      handleInputChange={handleInputChange}
                    />
                    <CustomTextField
                      formData={formData}
                      label="OAB/CRC"
                      name="oab"
                      errorMessage={getErrorMessage(0, 'oab')}
                      handleInputChange={handleInputChange}
                    />
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <CustomTextField
                      formData={formData}
                      label="CNPJ"
                      name="cnpj_cpf"
                      errorMessage={getErrorMessage(0, 'cnpj_cpf')}
                      handleInputChange={handleInputChange}
                    />

                    <CustomSelectField
                      formData={formData}
                      label="Tipo da Sociedade"
                      name="society_type"
                      options={societyType}
                      errorMessage={getErrorMessage(0, 'society_type')}
                      handleSelectChange={handleSelectChange}
                    />
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <CustomDateField
                      formData={formData}
                      label="Data de Função Exp. OAB"
                      name="foundation_date"
                      errorMessage={getErrorMessage(0, 'foundation_date')}
                      handleInputChange={handleInputChange}
                      maxDate={currentDate}
                    />

                    <CustomSelectField
                      formData={formData}
                      label="Enquadramento Contábil"
                      name="accounting_type"
                      options={accountingType}
                      errorMessage={getErrorMessage(0, 'accounting_type')}
                      handleSelectChange={handleSelectChange}
                    />
                  </Flex>
                </Box>
              </Box>
            </Flex>

            <Divider />

            <Flex>
              <Box width={'300px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Dados Bancário'}
                </Typography>
              </Box>
              <Box
                display={'flex'}
                flexDirection={'column'}
                gap={'16px'}
                style={{
                  flex: 1,
                }}
              >
                <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                  {'Banco'}
                </Typography>

                <Autocomplete
                  limitTags={1}
                  id="multiple-limit-tags"
                  options={bankList}
                  getOptionLabel={option => (option.name ? option.name : '')}
                  isOptionEqualToValue={(option, value) => option.ispb === value.ispb}
                  onChange={(event, value) => handleBankChange(value)}
                  value={
                    formData.bank_name
                      ? bankList.find(bank => bank.name == formData.bank_name)
                      : null
                  }
                  renderInput={params => (
                    <TextField
                      placeholder="Selecione um Banco"
                      {...params}
                      size="small"
                      error={!!errors.bank_name}
                    />
                  )}
                  sx={{ backgroundColor: 'white', zIndex: 1 }}
                  noOptionsText="Nenhum Banco Encontrado"
                />

                <Flex style={{ gap: '16px' }}>
                  <CustomTextField
                    formData={formData}
                    label="Agência"
                    name="agency"
                    errorMessage={getErrorMessage(0, 'agency')}
                    handleInputChange={handleInputChange}
                  />
                  <Box width={'100px'}>
                    <CustomTextField
                      formData={formData}
                      label="Operação"
                      name="operation"
                      errorMessage={getErrorMessage(0, 'operation')}
                      handleInputChange={handleInputChange}
                    />
                  </Box>
                  <CustomTextField
                    formData={formData}
                    label="Conta"
                    placeholder="Número da Conta"
                    name="acccount"
                    errorMessage={getErrorMessage(0, 'account')}
                    handleInputChange={handleInputChange}
                  />
                </Flex>

                <Box>
                  <CustomTextField
                    formData={formData}
                    label="Chave Pix"
                    name="pix"
                    errorMessage={getErrorMessage(0, 'pix')}
                    handleInputChange={handleInputChange}
                  />
                </Box>
              </Box>
            </Flex>

            <Divider />

            <Flex>
              <Box width={'300px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Endereço'}
                </Typography>
              </Box>

              <Box display={'flex'} gap={'24px'} flex={1}>
                <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                  <CustomTextField
                    formData={formData}
                    label="CEP"
                    name="cep"
                    errorMessage={getErrorMessage(0, 'cep')}
                    handleInputChange={handleInputChange}
                  />
                  <Flex style={{ gap: '16px' }}>
                    <CustomTextField
                      formData={formData}
                      label="Endereço"
                      name="address"
                      errorMessage={getErrorMessage(0, 'address')}
                      handleInputChange={handleInputChange}
                    />
                    <Box maxWidth={'30%'}>
                      <CustomTextField
                        formData={formData}
                        label="Número"
                        name="number"
                        errorMessage={getErrorMessage(0, 'number')}
                        placeholder="N.º"
                        handleInputChange={handleInputChange}
                      />
                    </Box>
                  </Flex>
                  <CustomTextField
                    formData={formData}
                    label="Complemento"
                    name="description"
                    errorMessage={getErrorMessage(0, 'description')}
                    handleInputChange={handleInputChange}
                  />
                </Box>

                <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                  <CustomTextField
                    formData={formData}
                    label="Bairro"
                    name="neighborhood"
                    errorMessage={getErrorMessage(0, 'neighborhood')}
                    handleInputChange={handleInputChange}
                  />

                  <CustomTextField
                    formData={formData}
                    label="Cidade"
                    name="city"
                    errorMessage={getErrorMessage(0, 'city')}
                    handleInputChange={handleInputChange}
                  />

                  <CustomTextField
                    formData={formData}
                    label="Estado"
                    name="state"
                    errorMessage={getErrorMessage(0, 'state')}
                    handleInputChange={handleInputChange}
                  />
                </Box>
              </Box>
            </Flex>

            <Divider />

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
          </form>

          <Divider />

          <Flex>
            <Box width={'300px'}>
              <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                {'Informações Adicionais'}
              </Typography>
            </Box>

            <Box style={{ flex: 1 }}>
              <Box
                display={'flex'}
                flexDirection={'column'}
                gap={'16px'}
                style={{
                  flex: 1,
                }}
              >
                <Flex style={{ gap: '24px' }}>
                  <CustomTextField
                    formData={formData}
                    label="Site"
                    name="webSite"
                    errorMessage={getErrorMessage(0, 'webSite')}
                    handleInputChange={handleInputChange}
                  />
                  <Flex style={{ flexDirection: 'column', flex: 1, marginBottom: '16px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Sócio Administrador'}
                    </Typography>

                    <Autocomplete
                      limitTags={1}
                      id="multiple-limit-tags"
                      value={
                        formData.responsible_lawyer
                          ? adminsList.find(
                              (lawyer: any) => lawyer.id == formData.responsible_lawyer,
                            )
                          : ''
                      }
                      options={adminsList}
                      getOptionLabel={(option: any) =>
                        option && option.attributes
                          ? `${option.attributes.name} ${option.attributes.last_name}`
                          : ''
                      }
                      onChange={(event, value) =>
                        handleResponsibleChange('responsible_lawyer', value)
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          placeholder={'Selecione o Responsável'}
                          size="small"
                        />
                      )}
                      noOptionsText={`Nenhuma Responsável Encontrado`}
                    />
                  </Flex>
                </Flex>
              </Box>
            </Box>
          </Flex>

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
                Router.push('/escritorios');
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
              onClick={() => handleSubmitForm()}
            >
              {loading ? <CircularProgress size={20} sx={{ color: colors.white }} /> : 'Salvar'}
            </Button>
          </Box>
        </ContentContainer>
      </Container>
    </>
  );
};

export default Office;
