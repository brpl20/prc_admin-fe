import { useState, ChangeEvent, useEffect, useContext } from 'react';
import { IoAddCircleOutline, IoCheckmark, IoClose } from 'react-icons/io5';

import { TextField, Box, Typography, Button, Autocomplete, CircularProgress } from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';
import { getCEPDetails } from '@/services/brasilAPI';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import {
  gendersOptions,
  civilStatusOptions,
  nationalityOptions,
  UserRegisterTypesOptions,
} from '@/utils/constants';

import { Container, Title } from './styles';
import { colors, ContentContainer } from '@/styles/globals';

import dayjs from 'dayjs';
import { IoMdTrash } from 'react-icons/io';

import { Flex, Divider } from '@/styles/globals';
import { getAllOffices } from '@/services/offices';
import { getAllBanks } from '@/services/brasilAPI';
import { createProfileAdmin, updateAdmin, updateProfileAdmin } from '@/services/admins';
import { IOfficeProps } from '@/interfaces/IOffice';

import Router, { useRouter } from 'next/router';
import { cepMask, cpfMask, phoneMask } from '@/utils/masks';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import {
  isDateBeforeToday,
  isValidCPF,
  isValidEmail,
  isValidPhoneNumber,
  isValidRG,
} from '@/utils/validator';
import { ZodFormError, ZodFormErrors } from '@/types/zod';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import CustomDateField from '@/components/FormInputFields/CustomDateField';
import CustomSelectField from '@/components/FormInputFields/CustomSelectField';
import { isAxiosError } from 'axios';
import { IProfileAdminAttributes } from '@/interfaces/IAdmin';
import { LoadingOverlay } from '../work/one/styles';

interface FormData {
  officeId: string;
  name: string;
  last_name: string;
  cpf: string;
  rg: string;
  gender: string;
  mother_name: string;
  nationality: string;
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

  userEmail: string;
  password: string;
  confirmPassword: string;
}

interface props {
  dataToEdit?: any;
  isLoading: boolean;
}

const userSchema = z
  .object({
    name: z.string().min(2, { message: 'O campo Nome é obrigatório.' }),
    last_name: z.string().min(2, { message: 'O campo Sobrenome é obrigatório.' }),
    cpf: z
      .string()
      .min(11, { message: 'O CPF precisa ter no mínimo 11 dígitos.' })
      .refine(isValidCPF, { message: 'O CPF informado é inválido.' }),
    rg: z
      .string()
      .min(1, { message: 'RG é um campo obrigatório.' })
      .refine(isValidRG, { message: 'O RG informado é inválido.' }),
    mother_name: z.string().min(2, { message: 'O campo Nome da Mãe é obrigatório.' }),
    gender: z.string().min(2, { message: 'O campo Gênero é obrigatório.' }),
    civil_status: z.string().min(2, { message: 'O campo Estado Civil é obrigatório.' }),
    nationality: z.string().min(2, { message: 'O campo Naturalidade é obrigatório.' }),
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
    userEmail: z
      .string({ required_error: 'E-mail de Acesso é um campo obrigatório.' })
      .min(1, 'E-mail de Acesso é um campo obrigatório.')
      .refine(isValidEmail, { message: 'E-mail inválido.' }),
    birth: z
      .string()
      .min(2, { message: 'O campo Data de Nascimento é obrigatório.' })
      .refine(isDateBeforeToday, { message: 'Data de Nascimento inválida.' }),
    role: z.string().min(2, { message: 'O campo Tipo do Usuário é obrigatório.' }),
    city: z.string().min(2, { message: 'O campo Cidade é obrigatório.' }),
    state: z.string().min(2, { message: 'O campo Estado é obrigatório.' }),
    neighborhood: z.string().min(2, { message: 'O campo Bairro é obrigatório.' }),
    address: z.string().min(2, { message: 'O campo Endereço é obrigatório.' }),
    number: z.number().min(1, { message: 'O campo Número é obrigatório.' }),
    cep: z.string().min(2, { message: 'O campo CEP é obrigatório.' }),
    oab: z.string().optional(),
  })
  .refine(data => data.role !== 'lawyer' || (data.oab && data.oab.trim().length > 0), {
    message: 'O campo OAB é obrigatório para advogados.',
    path: ['oab'],
  });

const User = ({ dataToEdit, isLoading }: props) => {
  const { data: session } = useSession();

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
    birth: '',
    cpf: '',
    rg: '',
    gender: '',
    mother_name: '',
    nationality: '',
    role: '',
    civil_status: '',
    oab: '',
    cep: '',
    address: '',
    state: '',
    city: '',
    number: '',
    description: '',
    neighborhood: '',

    bank_name: '',
    agency: '',
    op: '',
    account: '',
    pix: '',

    userEmail: '',
    password: '',
    confirmPassword: '',
  } as FormData);
  const [contactData, setContactData] = useState({
    phoneInputFields: [{ phone_number: '' }],
    emailInputFields: [{ email: '' }],
  });

  const resetValues = () => {
    setFormData({
      officeId: '',
      name: '',
      last_name: '',
      cpf: '',
      rg: '',
      birth: '',
      gender: '',
      mother_name: '',
      nationality: '',
      role: '',
      civil_status: '',
      oab: '',
      cep: '',
      address: '',
      state: '',
      city: '',
      number: '',
      description: '',
      neighborhood: '',

      bank_name: '',
      agency: '',
      op: '',
      account: '',
      pix: '',

      userEmail: '',
      password: '',
      confirmPassword: '',
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

    if (name === 'cep') {
      setFormData(prevData => ({
        ...prevData,
        ['address']: '',
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
      newInputFields[index] =
        inputArrayName === 'phoneInputFields'
          ? { phone_number: phoneMask(value) }
          : { email: value };

      return { ...prevData, [inputArrayName]: newInputFields };
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
        phone_numbers: contactData.phoneInputFields.map(field => field.phone_number),
        emails: contactData.emailInputFields.map(field => field.email),
        role: formData.role,
        bank_name: formData.bank_name,
        agency: formData.agency,
        op: formData.op,
        oab: formData.oab,
        account: formData.account,
        pix: formData.pix,
        password: formData.password,
        birth: formData.birth,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        neighborhood: formData.neighborhood,
        number: Number(formData.number),
        cep: formData.cep,
        userEmail: formData.userEmail,
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
          name: formData.name.trim(),
          last_name: formData.last_name.trim(),
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
        await updateProfileAdmin(id, editData);

        // Only attempt email update if it was actually changed
        const attributes: IProfileAdminAttributes = dataToEdit.data.attributes;

        if (formData.userEmail !== attributes.access_email) {
          const adminEmailData = {
            admin: {
              email: formData.userEmail,
            },
          };
          await updateAdmin(String(attributes.admin_id), adminEmailData);
        }

        Router.push('/usuarios');
      }

      if (!isEditing) {
        data = {
          oab: formData.oab,
          name: formData.name.trim(),
          last_name: formData.last_name.trim(),
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
            email: formData.userEmail,
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

        await createProfileAdmin(data);

        Router.push('/usuarios');
      }
    } catch (err: any) {
      handleFormError(err);
    } finally {
      setLoading(false);
    }
  };
  const handleFormError = (error: unknown) => {
    // Check if its an API error
    if (isAxiosError(error)) {
      if (error.response?.data.errors && Array.isArray(error.response?.data.errors)) {
        const apiError = error.response.data.errors[0].code;
        setMessage(apiError || 'Ocorreu um erro inesperado. Por favor, tente novamente.');
        setType('error');
        setOpenSnackbar(true);
        return;
      }
    }

    // Assume the error is of type `{ issues: ZodFormError[] }`
    const zodError = error as { issues: ZodFormError[] };
    const newErrors = zodError.issues ?? [];

    if (newErrors.length === 0) {
      setMessage('Ocorreu um erro inesperado ao enviar os dados.');
      setType('error');
      setOpenSnackbar(true);
      return;
    }

    setMessage('Corrija os erros no formulário.');
    setType('error');
    setOpenSnackbar(true);
    const result: ZodFormErrors = {};

    newErrors.forEach(err => {
      const [field, index] = err.path;

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
      const attributes: IProfileAdminAttributes = dataToEdit.data.attributes;

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
          officeId: attributes.office_id ? String(attributes.office_id) : '',
          name: attributes.name ? attributes.name : '',
          last_name: attributes.last_name ? attributes.last_name : '',
          cpf: attributes.cpf ? attributes.cpf : '',
          rg: attributes.rg ? attributes.rg : '',
          address: addresses.street ? addresses.street : '',
          number: addresses.number ? String(addresses.number) : '',
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
          userEmail: attributes.access_email,
          password: '',
          street: addresses.street ? addresses.street : '',
          confirmPassword: '',
          gender: attributes.gender ? attributes.gender : '',
          mother_name: attributes.mother_name ? attributes.mother_name : '',
          nationality: attributes.nationality ? attributes.nationality : '',
          role: attributes.role ? attributes.role : '',
          civil_status: attributes.civil_status ? attributes.civil_status : '',
          birth: attributes.birth ? attributes.birth : '',
          oab: attributes.oab ? attributes.oab : '',
        });

        const office = officesList.find(office => office.id == String(attributes.office_id));

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
      if (!formData.cep || formData.address !== '') {
        return;
      }

      const numericCEP = formData.cep.replace(/\D/g, '');

      if (numericCEP.length !== 8) {
        return;
      }

      try {
        const response = await getCEPDetails(numericCEP);
        setFormData(prevData => ({
          ...prevData,
          state: response.state,
          city: response.city,
          address: response.street,
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
    };

    fetchCEPDetails();
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
        {isLoading && (
          <LoadingOverlay>
            <CircularProgress size={50} sx={{ color: colors.primary }} />
          </LoadingOverlay>
        )}

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
                    <CustomTextField
                      formData={formData}
                      name="name"
                      label="Nome do Usuário"
                      errorMessage={getErrorMessage(0, 'name')}
                      handleInputChange={handleInputChange}
                    />

                    <CustomTextField
                      formData={formData}
                      name="last_name"
                      label="Sobrenome do Usuário"
                      errorMessage={getErrorMessage(0, 'last_name')}
                      handleInputChange={handleInputChange}
                    />
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <CustomTextField
                      formData={formData}
                      name="cpf"
                      label="CPF"
                      errorMessage={getErrorMessage(0, 'cpf')}
                      handleInputChange={handleInputChange}
                    />
                    <CustomTextField
                      formData={formData}
                      name="rg"
                      label="RG"
                      errorMessage={getErrorMessage(0, 'rg')}
                      handleInputChange={handleInputChange}
                    />
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <CustomDateField
                      formData={formData}
                      name={'birth'}
                      label={'Data de Nascimento'}
                      errorMessage={getErrorMessage(0, 'birth')}
                      maxDate={currentDate}
                      handleInputChange={handleInputChange}
                    />
                    <CustomTextField
                      formData={formData}
                      name="mother_name"
                      label="Nome da Mãe"
                      errorMessage={getErrorMessage(0, 'mother_name')}
                      handleInputChange={handleInputChange}
                    />
                  </Flex>
                </Box>

                <Flex
                  style={{
                    flex: 1,
                    marginTop: '16px',
                    gap: '24px',
                  }}
                >
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

                  <CustomSelectField
                    formData={formData}
                    name="nationality"
                    label="Naturalidade"
                    errorMessage={getErrorMessage(0, 'nationality')}
                    options={nationalityOptions}
                    handleSelectChange={handleSelectChange}
                  />
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
                      name="address"
                      label="Endereço"
                      errorMessage={getErrorMessage(0, 'address')}
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
                  <CustomTextField
                    formData={formData}
                    name="oab"
                    label="OAB"
                    errorMessage={getErrorMessage(0, 'oab')}
                    handleInputChange={handleInputChange}
                  />
                </Flex>
                <Flex style={{ gap: '24px' }}>
                  <CustomSelectField
                    formData={formData}
                    name="role"
                    label="Tipo do Usuário"
                    options={
                      session?.role === 'counter'
                        ? UserRegisterTypesOptions.filter(option => option.value === 'counter')
                        : UserRegisterTypesOptions
                    }
                    errorMessage={getErrorMessage(0, 'role')}
                    handleSelectChange={handleSelectChange}
                  />

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
                            error={getErrorMessage(0, 'office_id')}
                            helperText={getErrorMessage(0, 'office_id')}
                            FormHelperTextProps={{ className: 'ml-2' }}
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
                    error={getErrorMessage(0, 'bank_name')}
                    helperText={getErrorMessage(0, 'bank_name')}
                    FormHelperTextProps={{ className: 'ml-2' }}
                  />
                )}
                sx={{ backgroundColor: 'white', zIndex: 1 }}
                noOptionsText="Nenhum Banco Encontrado"
              />

              <Flex style={{ gap: '16px' }}>
                <CustomTextField
                  formData={formData}
                  name="agency"
                  label="Agência"
                  errorMessage={getErrorMessage(0, 'agency')}
                  handleInputChange={handleInputChange}
                />

                <Box width={'100px'}>
                  <CustomTextField
                    formData={formData}
                    name="op"
                    label="Operação"
                    errorMessage={getErrorMessage(0, 'op')}
                    handleInputChange={handleInputChange}
                  />
                </Box>

                <CustomTextField
                  formData={formData}
                  name="account"
                  label="Conta"
                  errorMessage={getErrorMessage(0, 'account')}
                  handleInputChange={handleInputChange}
                />
              </Flex>

              <Box>
                <CustomTextField
                  formData={formData}
                  name="pix"
                  label="Chave Pix"
                  errorMessage={getErrorMessage(0, 'pix')}
                  handleInputChange={handleInputChange}
                />
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
                <CustomTextField
                  formData={formData}
                  name="userEmail"
                  label="E-mail"
                  errorMessage={getErrorMessage(0, 'userEmail')}
                  handleInputChange={handleInputChange}
                />
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
