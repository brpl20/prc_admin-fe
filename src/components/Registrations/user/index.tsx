import React, { useState, ChangeEvent, useEffect, useContext } from 'react';
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
} from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import {
  gendersOptions,
  civilStatusOptions,
  nationalityOptions,
  userTypeOptions,
  UserRegisterTypesOptions,
} from '@/utils/constants';

import { Container, Title, BirthdayContainer } from './styles';
import { colors, ContentContainer } from '@/styles/globals';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Flex, Divider } from '@/styles/globals';
import { getAllOffices } from '@/services/offices';
import { getAllBanks } from '@/services/brasilAPI';
import { createAdmin, updateAdmin } from '@/services/admins';
import { IOfficeProps } from '@/interfaces/IOffice';
import { animateScroll as scroll } from 'react-scroll';

import Router from 'next/router';
import { cepMask, cpfMask, rgMask } from '@/utils/masks';

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

  cep: string;
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
  pageTitle: string;
  dataToEdit?: any;
}

const User = ({ pageTitle, dataToEdit }: props) => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [officesList, setOfficesList] = useState<IOfficeProps[]>([]);

  const { setShowTitle, setPageTitle } = useContext(PageTitleContext);

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

  const [formData, setFormData] = useState<FormData>({} as FormData);
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
      if (!formData.name) throw new Error('O campo Nome é obrigatório.');
      if (!formData.last_name) throw new Error('O campo Sobrenome é obrigatório.');
      if (!formData.cpf) throw new Error('O campo CPF é obrigatório.');
      if (!formData.rg) throw new Error('O campo RG é obrigatório.');
      if (!selectedDate) throw new Error('O campo Data de Nascimento é obrigatório.');
      if (!formData.mother_name) throw new Error('O campo Nome da Mãe é obrigatório.');
      if (!formData.gender) throw new Error('O campo Gênero é obrigatório.');
      if (!formData.civil_status) throw new Error('O campo Estado Civil é obrigatório.');
      if (!formData.nationality) throw new Error('O campo Naturalidade é obrigatório.');
      if (!formData.cep) throw new Error('O campo CEP é obrigatório.');
      if (!formData.address) throw new Error('O campo Endereço é obrigatório.');
      if (!formData.number) throw new Error('O campo Número é obrigatório.');
      if (!formData.description) throw new Error('O campo Complemento é obrigatório.');
      if (!formData.neighborhood) throw new Error('O campo Bairro é obrigatório.');
      if (!formData.city) throw new Error('O campo Cidade é obrigatório.');
      if (!formData.state) throw new Error('O campo Estado é obrigatório.');
      if (contactData.phoneInputFields.some(field => field.phone_number.trim() === '')) {
        throw new Error('Telefone não pode estar vazio.');
      }
      if (contactData.emailInputFields.some(field => field.email.trim() === '')) {
        throw new Error('E-mail não pode estar vazio.');
      }
      if (!formData.officeId) throw new Error('O campo Escritório é obrigatório.');
      if (!formData.bank_name) throw new Error('O campo Banco é obrigatório.');
      if (!formData.agency) throw new Error('O campo Agência é obrigatório.');
      if (!formData.op) throw new Error('O campo Operação é obrigatório.');
      if (!formData.account) throw new Error('O campo Conta é obrigatório.');
      if (!formData.pix) throw new Error('O campo Chave Pix é obrigatório.');
      if (!formData.email) throw new Error('O campo E-mail é obrigatório.');
      if (!formData.role) throw new Error('O campo Tipo do Usuário é obrigatório.');
      if (!formData.password && !isEditing) throw new Error('O campo Senha é obrigatório.');
      if (!formData.confirmPassword && !isEditing)
        throw new Error('O campo Confirmar Senha é obrigatório.');
      if (formData.password !== formData.confirmPassword && !isEditing) {
        throw new Error('As senhas não coincidem.');
      }

      let data = {};

      if (isEditing) {
        dataToEdit.data.attributes.phones = contactData.phoneInputFields;
        dataToEdit.data.attributes.emails = contactData.emailInputFields;

        const editData = {
          addresses_attributes: {
            id: dataToEdit.data.attributes.addresses[0].id,
            description: formData.description,
            zip_code: formData.cep,
            street: formData.address,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
          bank_accounts_attributes: {
            id: dataToEdit.data.attributes.bank_accounts[0].id,
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
          birth: selectedDate,
          mother_name: formData.mother_name,
          office_id: formData.officeId,
          role: formData.role,
          status: 'active',
          oab: '0000',
        };

        const id = dataToEdit.data.id;

        await updateAdmin(id, editData);

        Router.push('/usuarios');
      }

      if (!isEditing) {
        data = {
          oab: '0000',
          name: formData.name,
          last_name: formData.last_name,
          cpf: formData.cpf,
          rg: formData.rg,
          gender: formData.gender,
          nationality: formData.nationality,
          civil_status: formData.civil_status,
          birth: selectedDate,
          mother_name: formData.mother_name,
          office_id: formData.officeId,
          role: formData.role,
          status: 'active',
          addresses_attributes: [
            {
              description: formData.description,
              zip_code: formData.cep,
              street: formData.address,
              number: formData.number,
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
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
  };

  const renderInputField = (
    name: keyof FormData,
    title: string,
    placeholderText: string,
    error: boolean,
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
        setBankList(uniqueBanks);
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
      const response = await getAllOffices();
      setOfficesList(response.data);
    };

    getOffices();
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

        const phones = attributes.phones ? attributes.phones : [{ phone_number: '' }];
        const emails = attributes.emails ? attributes.emails : [{ email: '' }];

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
          confirmPassword: '',
          gender: attributes.gender ? attributes.gender : '',
          mother_name: attributes.mother_name ? attributes.mother_name : '',
          nationality: attributes.nationality ? attributes.nationality : '',
          professional_record: attributes.professional_record ? attributes.professional_record : '',
          role: attributes.role ? attributes.role : '',
          civil_status: attributes.civil_status ? attributes.civil_status : '',
          birth: attributes.birth ? attributes.birth : '',
        });

        const office = officesList.find(office => office.id == attributes.office_id);

        setSelectedOffice(office as IOfficeProps);

        setContactData({
          phoneInputFields: phones,
          emailInputFields: emails,
        });

        setSelectedDate(dayjs(attributes.birth));
      }
    };

    if (dataToEdit && dataToEdit.data) {
      handleDataForm();
    }
  }, [dataToEdit, officesList, bankList]);

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
                    {renderInputField('name', 'Nome', 'Nome do Usuário', !!errors.name)}
                    {renderInputField(
                      'last_name',
                      'Sobrenome',
                      'Sobrenome do Usuário',
                      !!errors.last_name,
                    )}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    {renderInputField('cpf', 'CPF', 'Informe o CPF', !!errors.cpf)}
                    {renderInputField('rg', 'RG', 'Informe o RG', !!errors.rg)}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <BirthdayContainer>
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
                          value={dayjs(selectedDate)}
                          onChange={handleBirthDate}
                        />
                      </LocalizationProvider>
                    </BirthdayContainer>
                    {renderInputField('mother_name', 'Nome da Mãe', 'Informe o Nome', !!errors.rg)}
                  </Flex>
                </Box>

                <Flex
                  style={{
                    flex: 1,
                    marginTop: '16px',
                    gap: '24px',
                  }}
                >
                  {renderSelectField('Gênero', 'gender', gendersOptions)}
                  {renderSelectField('Estado Civil', 'civil_status', civilStatusOptions)}
                  {renderSelectField('Naturalidade', 'nationality', nationalityOptions)}
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
                  {renderInputField('cep', 'CEP', 'Informe o CEP', !!errors.cep)}
                  <Flex style={{ gap: '16px' }}>
                    {renderInputField(
                      'address',
                      'Endereço',
                      'Informe o Endereço',

                      !!errors.address,
                    )}
                    <Box maxWidth={'30%'}>
                      {renderInputField('number', 'Número', 'N.º', !!errors.address)}
                    </Box>
                  </Flex>
                  {renderInputField(
                    'description',
                    'Complemento',
                    'Informe o Estado',
                    !!errors.state,
                  )}
                </Box>

                <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                  {renderInputField('neighborhood', 'Bairro', 'Informe o Estado', !!errors.state)}
                  {renderInputField('city', 'Cidade', 'Informe a Cidade', !!errors.city)}
                  {renderInputField('state', 'Estado', 'Informe o Estado', !!errors.state)}
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
                        error={!/^\S+@\S+\.\S+$/.test(inputValue.email) && inputValue.email !== ''}
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
          </form>

          <Divider />

          <Flex>
            <Box width={'210px'}>
              <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                {'Dados Pessoais'}
              </Typography>
            </Box>

            <Box style={{ flex: 1 }}>
              <Box
                display={'flex'}
                gap={'16px'}
                style={{
                  flex: 1,
                }}
              >
                <Flex style={{ gap: '24px', width: '50%' }}>
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
                        <TextField placeholder="Selecione um Escritório" {...params} size="small" />
                      )}
                      noOptionsText="Nenhum Escritório Encontrado"
                      onChange={(event, value) => {
                        handleSelectedOffice(value);
                      }}
                      value={selectedOffice}
                    />
                  </Flex>
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
                  <TextField placeholder="Selecione um Banco" {...params} size="small" />
                )}
                sx={{ backgroundColor: 'white', zIndex: 1 }}
                noOptionsText="Nenhum Banco Encontrado"
              />

              <Flex style={{ gap: '16px' }}>
                {renderInputField('agency', 'Agência', 'Número da agencia', !!errors.agency)}
                <Box width={'100px'}>{renderInputField('op', 'Operação', 'Op.', !!errors.op)}</Box>
                {renderInputField('account', 'Conta', 'Número da conta', !!errors.account)}
              </Flex>

              <Box>
                {renderInputField('pix', 'Cadastrar Chave Pix', 'Informe a chave', !!errors.pix)}
              </Box>
            </Box>
          </Flex>

          {!isEditing && (
            <>
              <Divider />

              <Flex>
                <Box width={'210px'}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {'Acesso ao Sistema'}
                  </Typography>
                </Box>

                <Box style={{ flex: 1 }}>
                  <Flex style={{ gap: '24px' }}>
                    {renderInputField('email', 'E-mail', 'Informe seu e-mail', !!errors.email)}
                    {renderSelectField('Tipo do Usuário', 'role', UserRegisterTypesOptions)}
                  </Flex>

                  <Flex style={{ gap: '24px', marginTop: '16px' }}>
                    <Flex style={{ flexDirection: 'column', flex: 1 }}>
                      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                        {'Senha'}
                      </Typography>
                      <TextField
                        variant="outlined"
                        error={errors.password}
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
                        error={passwordError}
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
                </Box>
              </Flex>
            </>
          )}

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
              onClick={() => setOpenModal(true)}
            >
              {'Salvar'}
            </Button>
          </Box>
        </ContentContainer>
      </Container>
    </>
  );
};

export default User;
