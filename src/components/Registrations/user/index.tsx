import { useState, ChangeEvent, useEffect, useContext } from 'react';
import { IoAddCircleOutline, IoCheckmark, IoClose } from 'react-icons/io5';

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
import { getCEPDetails } from '@/services/brasilAPI';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import {
  gendersOptions,
  civilStatusOptions,
  nationalityOptions,
  UserRegisterTypesOptions,
} from '@/utils/constants';

import { Container, Title, BirthdayContainer } from './styles';
import { colors, ContentContainer } from '@/styles/globals';

import dayjs from 'dayjs';
import { IoMdTrash } from 'react-icons/io';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Flex, Divider } from '@/styles/globals';
import { getAllOffices } from '@/services/offices';
import { getAllBanks } from '@/services/brasilAPI';
import { createAdmin, updateAdmin } from '@/services/admins';
import { IOfficeProps } from '@/interfaces/IOffice';

import Router, { useRouter } from 'next/router';
import { cepMask, cpfMask } from '@/utils/masks';
import { z } from 'zod';
import { useSession } from 'next-auth/react';

interface FormData {
  officeId: string;
  name: string;
  last_name: string;
  cpf: string;
  rg: string;
  gender: string;
  mother_name: string;
  nationality: string;
  professional_record: string;
  role: string;
  civil_status: string;
  birth: string;
  oab: string;
  cep: string;
  street: string;
  address: string;
  state: string;
  city: string;
  number: string;
  description: string;
  neighborhood: string;

  bank_name: string;
  agency: string;
  op: string;
  account: string;
  pix: string;

  email: string;
  password: string;
  confirmPassword: string;
}

interface props {
  dataToEdit?: any;
}

const userSchema = z.object({
  name: z.string().min(2, { message: 'O campo Nome é obrigatório.' }),
  last_name: z.string().min(2, { message: 'O campo Sobrenome é obrigatório.' }),
  cpf: z.string().min(2, { message: 'O campo CPF é obrigatório.' }),
  rg: z.string().min(2, { message: 'O campo RG é obrigatório.' }),
  mother_name: z.string().min(2, { message: 'O campo Nome da Mãe é obrigatório.' }),
  gender: z.string().min(2, { message: 'O campo Gênero é obrigatório.' }),
  civil_status: z.string().min(2, { message: 'O campo Estado Civil é obrigatório.' }),
  nationality: z.string().min(2, { message: 'O campo Naturalidade é obrigatório.' }),
  phone: z.string().min(2, { message: 'O campo Telefone é obrigatório.' }),
  email: z.string().min(2, { message: 'O campo E-mail é obrigatório.' }),
  userType: z.string().min(2, { message: 'O campo Tipo do Usuário é obrigatório.' }),
  userEmail: z.string().min(2, { message: 'O campo E-mail é obrigatório.' }),
  city: z.string().min(2, { message: 'O campo Cidade é obrigatório.' }),
  state: z.string().min(2, { message: 'O campo Estado é obrigatório.' }),
  address: z.string().min(2, { message: 'O campo Endereço é obrigatório.' }),
  number: z.number().min(1, { message: 'O campo Número é obrigatório.' }),
  cep: z.string().min(2, { message: 'O campo CEP é obrigatório.' }),
});

const User = ({ dataToEdit }: props) => {
  const { data: session } = useSession();
  const today = new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [officesList, setOfficesList] = useState<IOfficeProps[]>([]);

  const { setShowTitle, setPageTitle, pageTitle } = useContext(PageTitleContext);
  const route = useRouter();
  const currentDate = dayjs();
  const [bankList, setBankList] = useState([] as any[]);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedOffice, setSelectedOffice] = useState<IOfficeProps>({} as IOfficeProps);

  const [passwordError, setPasswordError] = useState(false);
  const [passwordIsValid, setPasswordIsValid] = useState(false);
  const [passwordHasNumber, setPasswordHasNumber] = useState(false);

  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState<FormData>({
    officeId: '',
    name: '',
    last_name: '',
    cpf: '',
    rg: '',
    agency: '',
    email: '',
    password: '',
    confirmPassword: '',
  } as FormData);
  const [contactData, setContactData] = useState({
    phoneInputFields: [{ phone_number: '' }],
    emailInputFields: [{ email: '' }],
  });

  const resetValues = () => {
    setFormData({} as FormData);
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

    if (name === 'agency' || name === 'account' || name === 'op') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value.replace(/\D/g, ''),
      }));
      return;
    }

    if (name === 'cpf') {
      setFormData(prevData => ({
        ...prevData,
        cpf: cpfMask(value),
      }));
      return;
    }

    if (name === 'cep') {
      setFormData(prevData => ({
        ...prevData,
        cep: cepMask(value),
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

  const handleSubmitForm = async () => {
    setLoading(true);

    try {
      userSchema.parse({
        name: formData.name,
        last_name: formData.last_name,
        cpf: formData.cpf,
        rg: formData.rg,
        mother_name: formData.mother_name,
        gender: formData.gender,
        civil_status: formData.civil_status,
        nationality: formData.nationality,
        phone: contactData.phoneInputFields[0].phone_number,
        email: contactData.emailInputFields[0].email,
        userType: formData.role,
        bank_name: formData.bank_name,
        agency: formData.agency,
        op: formData.op,
        account: formData.account,
        pix: formData.pix,
        userEmail: formData.email,
        password: formData.password,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        number: formData.number ? Number(formData.number) : '',
        cep: formData.cep,
        systemEmail: formData.email,
      });

      if (!isEditing && formData.password === '') {
        setMessage('Senha obrigatória.');
        setType('error');
        setOpenSnackbar(true);
        return;
      }

      let data = {};

      if (isEditing) {
        dataToEdit.data.attributes.phones = contactData.phoneInputFields;
        dataToEdit.data.attributes.emails = contactData.emailInputFields;

        let editData = {
          addresses_attributes: {
            id: dataToEdit.data.attributes.addresses[0]?.id ?? '',
            description: formData.description,
            zip_code: formData.cep,
            street: formData.address,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
          bank_accounts_attributes: {
            id: dataToEdit.data.attributes.bank_accounts[0]?.id ?? '',
            bank_name: formData.bank_name,
            type_account: formData.op,
            agency: formData.agency,
            account: formData.account,
            pix: formData.pix,
          },
          phones_attributes: contactData.phoneInputFields,
          emails_attributes: contactData.emailInputFields,
          name: formData.name,
          last_name: formData.last_name,
          cpf: formData.cpf,
          rg: formData.rg,
          gender: formData.gender,
          nationality: formData.nationality,
          civil_status: formData.civil_status,
          birth: formData.birth,
          mother_name: formData.mother_name,
          role: formData.role,
          status: 'active',
          oab: formData.oab,
        };

        if (formData.officeId !== '') {
          const newEditData = {
            ...editData,
            office_id: formData.officeId,
          };

          editData = newEditData;
        }

        const id = dataToEdit.data.id;

        await updateAdmin(id, editData);

        Router.push('/usuarios');
      }

      if (!isEditing) {
        data = {
          oab: formData.oab,
          name: formData.name,
          last_name: formData.last_name,
          cpf: formData.cpf,
          rg: formData.rg,
          gender: formData.gender,
          nationality: formData.nationality,
          civil_status: formData.civil_status,
          birth: formData.birth,
          mother_name: formData.mother_name,
          role: formData.role,
          status: 'active',
          office_id: formData.officeId,
          addresses_attributes: [
            {
              description: formData.description,
              zip_code: formData.cep,
              street: formData.address,
              number: formData.number ? Number(formData.number) : '',
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state,
            },
          ],
          bank_accounts_attributes: [
            {
              bank_name: formData.bank_name,
              type_account: formData.op,
              agency: formData.agency,
              account: formData.account,
              pix: formData.pix,
            },
          ],
          admin_attributes: {
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.confirmPassword,
          },
          phones_attributes: contactData.phoneInputFields,
          emails_attributes: contactData.emailInputFields,
        };

        if (formData.officeId !== '') {
          const newEditData = {
            ...data,
            office_id: formData.officeId,
          };

          data = newEditData;
        }

        await createAdmin(data);

        Router.push('/usuarios');
      }
    } catch (err) {
      handleFormError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = (error: any) => {
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: { [key: string]: string } = {};

    if (error.response && error.response.status === 400 && error.response.data.errors[0].code) {
      setMessage(error.response.data.errors[0].code[0]);
      setType('error');
      setOpenSnackbar(true);
      return;
    }

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
    length: number,
    placeholderText: string,
    error?: boolean,
  ) => (
    <Flex style={{ flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {title}
      </Typography>
      <TextField
        variant="outlined"
        error={error && !formData[name]}
        fullWidth
        name={name}
        size="small"
        inputProps={{ maxLength: length }}
        value={formData[name] || ''}
        autoComplete="off"
        placeholder={`${placeholderText}`}
        onChange={handleInputChange}
        type={name === 'number' ? 'number' : 'text'}
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
          value={formData[name] || ''}
          onChange={handleSelectChange}
          error={error && !formData[name]}
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

  const handleSelectedOffice = (office: any) => {
    setSelectedOffice(office);

    if (office) {
      setFormData(prevData => ({
        ...prevData,
        officeId: office.id,
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        officeId: '',
      }));
    }
  };

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
    if (pageTitle.search('terar') !== -1) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [pageTitle]);

  useEffect(() => {
    const validatePassword = () => {
      const password = formData.password;
      const confirmPassword = formData.confirmPassword;

      const isLengthValid = password && password.length >= 6 ? true : false;
      const hasNumber = /\d/.test(password);
      const isMatching = password === confirmPassword;

      setPasswordIsValid(isLengthValid);
      setPasswordHasNumber(hasNumber);
      setPasswordError(!isMatching);
    };

    validatePassword();
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    const getOffices = async () => {
      const response = await getAllOffices('');
      setOfficesList(response.data);
    };

    if (session?.role != 'counter') {
      getOffices();
    }
  }, [session]);

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
    const handleDataForm = () => {
      const attributes = dataToEdit.data.attributes;

      if (attributes) {
        const addresses = attributes.addresses[0]
          ? attributes.addresses[0]
          : {
              description: '',
              zip_code: '',
              street: '',
              number: '',
              neighborhood: '',
              city: '',
              state: '',
            };

        const bankAccounts = attributes.bank_accounts[0]
          ? attributes.bank_accounts[0]
          : {
              bank_name: '',
              type_account: '',
              agency: '',
              account: '',
              pix: '',
            };

        handleBankChange(bankAccounts.bank_name);

        setFormData({
          officeId: attributes.office_id ? attributes.office_id : '',
          name: attributes.name ? attributes.name : '',
          last_name: attributes.last_name ? attributes.last_name : '',
          cpf: attributes.cpf ? attributes.cpf : '',
          rg: attributes.rg ? attributes.rg : '',
          address: addresses.street ? addresses.street : '',
          number: addresses.number ? addresses.number : '',
          description: addresses.description ? addresses.description : '',
          neighborhood: addresses.neighborhood ? addresses.neighborhood : '',
          city: addresses.city ? addresses.city : '',
          state: addresses.state ? addresses.state : '',
          cep: addresses.zip_code ? addresses.zip_code : '',
          bank_name: bankAccounts.bank_name ? bankAccounts.bank_name : '',
          agency: bankAccounts.agency ? bankAccounts.agency : '',
          op: bankAccounts.type_account ? bankAccounts.type_account : '',
          account: bankAccounts.account ? bankAccounts.account : '',
          pix: bankAccounts.pix ? bankAccounts.pix : '',
          email: attributes.email ? attributes.email : '',
          password: '',
          street: addresses.street ? addresses.street : '',
          confirmPassword: '',
          gender: attributes.gender ? attributes.gender : '',
          mother_name: attributes.mother_name ? attributes.mother_name : '',
          nationality: attributes.nationality ? attributes.nationality : '',
          professional_record: attributes.professional_record ? attributes.professional_record : '',
          role: attributes.role ? attributes.role : '',
          civil_status: attributes.civil_status ? attributes.civil_status : '',
          birth: attributes.birth ? attributes.birth : '',
          oab: attributes.oab ? attributes.oab : '',
        });

        const office = officesList.find(office => office.id == attributes.office_id);

        setSelectedOffice(office as IOfficeProps);

        setContactData({
          phoneInputFields:
            attributes.phones && attributes.phones.length > 0
              ? attributes.phones
              : [{ phone_number: '' }],
          emailInputFields:
            attributes.emails && attributes.emails.length > 0 ? attributes.emails : [{ email: '' }],
        });

        setSelectedDate(dayjs(attributes.birth));
      }
    };

    if (dataToEdit && dataToEdit.data) {
      handleDataForm();
    }
  }, [dataToEdit, officesList, bankList]);

  useEffect(() => {
    setPageTitle(`${route.asPath.includes('cadastrar') ? 'Cadastro de' : 'Alterar'} Usuário`);
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
              <Box width={'210px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Dados Pessoais'}
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
                    {renderInputField('name', 'Nome', 99, 'Nome do Usuário', !!errors.name)}
                    {renderInputField(
                      'last_name',
                      'Sobrenome',
                      99,
                      'Sobrenome do Usuário',
                      !!errors.last_name,
                    )}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    {renderInputField('cpf', 'CPF', 14, 'Informe o CPF', !!errors.cpf)}
                    {renderInputField('rg', 'RG', 16, 'Informe o RG', !!errors.rg)}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <BirthdayContainer>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Flex>
                          <Typography mb={'8px'} variant="h6">
                            {'Data de Nascimento'}
                          </Typography>
                        </Flex>

                        <input
                          type="date"
                          name="birth"
                          max={today}
                          value={formData.birth}
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
                    </BirthdayContainer>
                    {renderInputField(
                      'mother_name',
                      'Nome da Mãe',
                      60,
                      'Informe o Nome',
                      !!errors.rg,
                    )}
                  </Flex>
                </Box>

                <Flex
                  style={{
                    flex: 1,
                    marginTop: '16px',
                    gap: '24px',
                  }}
                >
                  {renderSelectField('Gênero', 'gender', gendersOptions, !!errors.gender)}
                  {renderSelectField(
                    'Estado Civil',
                    'civil_status',
                    civilStatusOptions,
                    !!errors.civil_status,
                  )}
                  {renderSelectField(
                    'Naturalidade',
                    'nationality',
                    nationalityOptions,
                    !!errors.nationality,
                  )}
                </Flex>
              </Box>
            </Flex>

            <Divider />

            <Flex>
              <Box width={'210px'}>
                <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                  {'Endereço'}
                </Typography>
              </Box>

              <Box display={'flex'} gap={'24px'} flex={1}>
                <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                  {renderInputField('cep', 'CEP', 60, 'Informe o CEP', !!errors.cep)}
                  <Flex style={{ gap: '16px' }}>
                    {renderInputField(
                      'address',
                      'Endereço',
                      99,
                      'Informe o Endereço',

                      !!errors.address,
                    )}
                    <Box maxWidth={'30%'}>
                      {renderInputField('number', 'Número', 16, 'N.º', !!errors.address)}
                    </Box>
                  </Flex>
                  {renderInputField('description', 'Complemento', 99, 'Informe o Complemento')}
                </Box>

                <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                  {renderInputField(
                    'neighborhood',
                    'Bairro',
                    99,
                    'Informe o Bairro',
                    !!errors.state,
                  )}
                  {renderInputField('city', 'Cidade', 99, 'Informe a Cidade', !!errors.city)}
                  {renderInputField('state', 'Estado', 99, 'Informe o Estado', !!errors.state)}
                </Box>
              </Box>
            </Flex>

            <Divider />

            <Flex>
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
                      <div className="flex flex-row gap-1">
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
                          error={!!errors.phone}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveContact(index, 'phoneInputFields');
                          }}
                        >
                          <div
                            className={`flex  ${
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
                      <div className="flex flex-row gap-1">
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

                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveContact(index, 'emailInputFields');
                          }}
                        >
                          <div
                            className={`flex  ${
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
          </form>

          <Divider />

          <Flex>
            <Box width={'210px'}>
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
                  {renderInputField('oab', 'OAB', 60, 'Informe a OAB')}
                </Flex>
                <Flex style={{ gap: '24px' }}>
                  {renderSelectField(
                    'Tipo do Usuário',
                    'role',
                    session?.role === 'counter'
                      ? UserRegisterTypesOptions.filter(option => option.value === 'counter')
                      : UserRegisterTypesOptions,
                    !!errors.userType,
                  )}
                  {session?.role != 'counter' && (
                    <Flex style={{ flexDirection: 'column', flex: 1 }}>
                      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                        {'Escritório'}
                      </Typography>

                      <Autocomplete
                        disablePortal={true}
                        autoComplete
                        options={officesList}
                        getOptionLabel={option =>
                          option && option.attributes ? option.attributes.name : ''
                        }
                        renderInput={params => (
                          <TextField
                            placeholder="Selecione um Escritório"
                            {...params}
                            size="small"
                          />
                        )}
                        noOptionsText="Nenhum Escritório Encontrado"
                        onChange={(event, value) => {
                          handleSelectedOffice(value);
                        }}
                        value={selectedOffice}
                      />
                    </Flex>
                  )}
                </Flex>
              </Box>
            </Box>
          </Flex>

          <Divider />

          <Flex>
            <Box width={'210px'}>
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
                  formData.bank_name ? bankList.find(bank => bank.name == formData.bank_name) : null
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
                {renderInputField('agency', 'Agência', 99, 'Número da agencia', !!errors.agency)}
                <Box width={'100px'}>
                  {renderInputField('op', 'Operação', 20, 'Op.', !!errors.op)}
                </Box>
                {renderInputField('account', 'Conta', 99, 'Número da conta', !!errors.account)}
              </Flex>

              <Box>
                {renderInputField(
                  'pix',
                  'Cadastrar Chave Pix',
                  99,
                  'Informe a chave',
                  !!errors.pix,
                )}
              </Box>
            </Box>
          </Flex>

          <Divider />

          <Flex>
            <Box width={'210px'}>
              <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                {'Acesso ao Sistema'}
              </Typography>
            </Box>

            <Box style={{ flex: 1 }}>
              <Flex style={{ gap: '24px' }}>
                {renderInputField('email', 'E-mail', 99, 'Informe seu e-mail', !!errors.userEmail)}
              </Flex>

              {!isEditing && (
                <>
                  <Flex style={{ gap: '24px', marginTop: '16px' }}>
                    <Flex style={{ flexDirection: 'column', flex: 1 }}>
                      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                        {'Senha'}
                      </Typography>
                      <TextField
                        variant="outlined"
                        error={!passwordIsValid}
                        fullWidth
                        name="password"
                        size="small"
                        type="password"
                        value={formData.password || ''}
                        placeholder="Informe sua senha"
                        onChange={handleInputChange}
                      />
                    </Flex>

                    <Flex style={{ flexDirection: 'column', flex: 1 }}>
                      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                        {'Confirme sua Senha'}
                      </Typography>
                      <TextField
                        variant="outlined"
                        error={passwordError || !!errors.password}
                        fullWidth
                        name="confirmPassword"
                        size="small"
                        type="password"
                        value={formData.confirmPassword || ''}
                        placeholder="Confirme sua senha"
                        onChange={handleInputChange}
                      />
                    </Flex>
                  </Flex>

                  <Flex style={{ alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                    {passwordIsValid ? (
                      <IoCheckmark color={'green'} size={20} />
                    ) : (
                      <IoClose color={'gray'} size={20} />
                    )}
                    <Typography variant="body1" sx={{ color: passwordIsValid ? 'green' : 'gray' }}>
                      {' As senhas devem ter pelo menos 6 caracteres.'}
                    </Typography>
                  </Flex>

                  <Flex style={{ alignItems: 'center', gap: '8px' }}>
                    {passwordIsValid ? (
                      <IoCheckmark color={'green'} size={20} />
                    ) : (
                      <IoClose color={'gray'} size={20} />
                    )}

                    <Typography
                      variant="body1"
                      sx={{ color: passwordHasNumber ? 'green' : 'gray' }}
                    >
                      {'As senhas devem ter pelo menos um número.'}
                    </Typography>
                  </Flex>
                </>
              )}
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
                Router.push('/usuarios');
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

export default User;
