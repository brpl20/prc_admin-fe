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

import { getAllOfficeTypes } from '@/services/offices';
import { getAllBanks, getCEPDetails } from '@/services/brasilAPI';
import { createOffice, updateOffice } from '@/services/offices';

import Router, { useRouter } from 'next/router';
import { cepMask, cnpjMask } from '@/utils/masks';

import { IAdminPropsAttributes } from '@/interfaces/IAdmin';
import { getAllAdmins } from '@/services/admins';
import { z } from 'zod';
import { useSession } from 'next-auth/react';

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
  name: z.string().nonempty({ message: 'Informe o Nome do Escritório' }),
  office_type: z.string().nonempty({ message: 'Selecione o Tipo de Escritório' }),
  oab: z.string().nonempty({ message: 'Informe o Identificador OAB' }),
  cnpj_cpf: z.string().nonempty({ message: 'Informe o CNPJ/CPF' }),
  society_type: z.string().nonempty({ message: 'Informe o Tipo de Sociedade' }),
  cep: z.string().nonempty({ message: 'Informe o CEP' }),
  address: z.string().nonempty({ message: 'Informe o Endereço' }),
  state: z.string().nonempty({ message: 'Informe o Estado' }),
  city: z.string().nonempty({ message: 'Informe a Cidade' }),
  number: z.string().nonempty({ message: 'Informe o Número' }),
  neighborhood: z.string().nonempty({ message: 'Informe o Bairro' }),
  accounting_type: z.string().nonempty({ message: 'Selecione o Enquadramento Contábil' }),
  phone: z.string().nonempty({ message: 'Informe o Telefone' }),
  email: z.string().nonempty({ message: 'Informe o Email' }),
});

const Office = ({ dataToEdit }: props) => {
  const route = useRouter();

  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [adminsList, setAdminsList] = useState<IAdminPropsAttributes[]>([]);
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
        office_type: selectedOfficeType.id,
        oab: formData.oab,
        cnpj_cpf: formData.cnpj_cpf,
        society_type: formData.society_type,
        cep: formData.cep,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        number: formData.number.toString(),
        neighborhood: formData.neighborhood,
        accounting_type: formData.accounting_type,
        phone: contactData.phoneInputFields[0].phone_number,
        email: contactData.emailInputFields[0].email,
      });

      const office = {
        name: formData.name,
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
    } catch (err) {
      handleFormError(err);
    } finally {
      setLoading(false);
    }
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
        value={
          name === 'cnpj_cpf' && formData.cnpj_cpf
            ? formData.cnpj_cpf
            : name === 'cep' && formData.cep
            ? cepMask(formData.cep)
            : formData[name] || ''
        }
        autoComplete="off"
        placeholder={`${placeholderText}`}
        onChange={handleInputChange}
        error={error && !formData[name]}
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

  const handleDate = (date: any) => {
    const birthDate = new Date(date).toLocaleDateString('pt-BR');
    setSelectedDate(date);

    setFormData(prevData => ({
      ...prevData,
      foundation_date: birthDate,
    }));
  };

  const getAdmins = async () => {
    const response = await getAllAdmins();
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

  const handleFormError = (error: any) => {
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

  useEffect(() => {
    getAdmins();

    getOfficeTypes();
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
                        />
                      )}
                      sx={{ backgroundColor: 'white', zIndex: 1, width: '49%' }}
                      noOptionsText="Nenhum Tipo de Escritório Encontrado"
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
                    {renderInputField('name', 'Nome', 'Nome do Escritório', !!errors.name)}
                    {renderInputField('oab', 'OAB/CRC', 'Identificador OAB/CRC', !!errors.oab)}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    {renderInputField('cnpj_cpf', 'CNPJ', 'Informe o CNPJ', !!errors.cnpj_cpf)}
                    {renderSelectField(
                      'Tipo da Sociedade',
                      'society_type',
                      societyType,
                      !!errors.society_type,
                    )}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    <DateContainer>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Flex>
                          <Typography mb={'8px'} variant="h6">
                            {'Data de Função Exp. OAB'}
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
                          onChange={handleDate}
                        />
                      </LocalizationProvider>
                    </DateContainer>
                    {renderSelectField(
                      'Enquadramento Contábil',
                      'accounting_type',
                      accountingType,
                      !!errors.accounting_type,
                    )}
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
                  {renderInputField('agency', 'Agência', 'Número da agencia', !!errors.agency)}
                  <Box width={'100px'}>
                    {renderInputField('operation', 'Operação', 'Op.', !!errors.operation)}
                  </Box>
                  {renderInputField('account', 'Conta', 'Número da conta', !!errors.account)}
                </Flex>

                <Box>
                  {renderInputField('pix', 'Cadastrar Chave Pix', 'Informe a chave', !!errors.pix)}
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
                  {renderInputField('cep', 'CEP', 'Informe o CEP', !!errors.cep)}
                  <Flex style={{ gap: '16px' }}>
                    {renderInputField(
                      'address',
                      'Endereço',
                      'Informe o Endereço',
                      !!errors.address,
                    )}
                    <Box maxWidth={'30%'}>
                      {renderInputField('number', 'Número', 'N.º', !!errors.number)}
                    </Box>
                  </Flex>
                  {renderInputField(
                    'description',
                    'Complemento',
                    'Informe o Complemento',
                    !!errors.description,
                  )}
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
                        error={!!errors.phone}
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
                  {renderInputField('webSite', 'Site', 'Informe o Site')}
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
                        option && option.attributes ? option.attributes.name : ''
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
