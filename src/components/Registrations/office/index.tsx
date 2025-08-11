import { useState, ChangeEvent, useEffect, useContext } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';

import { TextField, Box, Typography, Button, Autocomplete, CircularProgress, Slider, Link } from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import { accountingType, societyType } from '@/utils/constants';

const partnershipTypes = [
  { value: 'socio', label: 'Sócio' },
  { value: 'associado', label: 'Associado' },
  { value: 'socio_de_servico', label: 'Sócio de Serviço' }
];

import { Container, Title } from './styles';
import { colors, ContentContainer } from '@/styles/globals';

import dayjs from 'dayjs';

import { Flex, Divider } from '@/styles/globals';
import { IoMdTrash } from 'react-icons/io';

import { getAllOfficeTypes } from '@/services/offices';
import { getAllBanks, getCEPDetails } from '@/services/brasilAPI';
import { getMinimumWage, getINSSCeiling, validateProLaboreAmount } from '@/services/systemSettings';
import { createOffice, updateOffice } from '@/services/offices';
import { createLegalEntityOffice, updateLegalEntityOffice } from '@/services/legalEntityOffices';

import Router, { useRouter } from 'next/router';

import { IProfileAdmin } from '@/interfaces/IAdmin';
import { getAllProfileAdmins } from '@/services/admins';
import { z } from 'zod';
import { isDateTodayOrBefore, isValidEmail, isValidPhoneNumber } from '@/utils/validator';
import { ZodFormError, ZodFormErrors } from '@/types/zod';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import CustomSelectField from '@/components/FormInputFields/CustomSelectField';
import CustomDateField from '@/components/FormInputFields/CustomDateField';
import { cepMask, cnpjMask, phoneMask } from '@/utils/masks';
import { LoadingOverlay } from '../work/one/styles';

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

interface Partner {
  lawyer_id: string;
  lawyer_name?: string;
  partnership_type: 'socio' | 'associado' | 'socio_de_servico' | '';
  ownership_percentage: number;
  is_managing_partner: boolean;
  pro_labore_amount?: number;
}

interface props {
  dataToEdit?: any;
  isLoading?: boolean;
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

const Office = ({ dataToEdit, isLoading }: props) => {
  const route = useRouter();

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [adminsList, setAdminsList] = useState<IProfileAdmin[]>([]);
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

  const [partners, setPartners] = useState<Partner[]>([
    {
      lawyer_id: '',
      partnership_type: '',
      ownership_percentage: 100,
      is_managing_partner: false
    }
  ]);

  // Estados para distribuição de lucros e contrato social
  const [profitDistribution, setProfitDistribution] = useState<'proportional' | 'disproportional'>('proportional');
  const [profitPercentages, setProfitPercentages] = useState<{ [key: number]: number }>({});
  const [createSocialContract, setCreateSocialContract] = useState(false);
  
  // Estados para pro-labore
  const [partnersWithProLabore, setPartnersWithProLabore] = useState(true);
  const [minimumWage, setMinimumWage] = useState<number>(1320);
  const [inssCeiling, setInssCeiling] = useState<number>(7507.49);
  const [proLaboreErrors, setProLaboreErrors] = useState<{ [key: number]: string }>({});

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
    setPartners([{
      lawyer_id: '',
      partnership_type: '',
      ownership_percentage: 100,
      is_managing_partner: false
    }]);
    setProfitDistribution('proportional');
    setProfitPercentages({});
    setCreateSocialContract(false);
    setPartnersWithProLabore(true);
    setProLaboreErrors({});
  };

  const handlePartnerChange = (index: number, field: keyof Partner, value: any) => {
    setPartners(prevPartners => {
      const newPartners = [...prevPartners];
      if (field === 'lawyer_id' && value) {
        newPartners[index] = {
          ...newPartners[index],
          [field]: value.id,
          lawyer_name: `${value.attributes.name} ${value.attributes.last_name}`
        };
      } else if (field === 'ownership_percentage') {
        // Ajustar percentuais proporcionalmente quando há 2 sócios
        if (newPartners.length === 2) {
          const otherIndex = index === 0 ? 1 : 0;
          const newPercentage = Math.max(0, Math.min(100, Number(value) || 0));
          newPartners[index] = {
            ...newPartners[index],
            ownership_percentage: newPercentage
          };
          newPartners[otherIndex] = {
            ...newPartners[otherIndex],
            ownership_percentage: 100 - newPercentage
          };
        } else {
          newPartners[index] = {
            ...newPartners[index],
            [field]: Math.max(0, Math.min(100, Number(value) || 0))
          };
        }
      } else if (field === 'pro_labore_amount') {
        // Validar valor do pro-labore
        const amount = Number(value) || 0;
        newPartners[index] = {
          ...newPartners[index],
          [field]: amount
        };
        
        // Validar e atualizar erros
        const error = validateProLaboreAmount(amount, minimumWage, inssCeiling);
        setProLaboreErrors(prev => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[index] = error;
          } else {
            delete newErrors[index];
          }
          return newErrors;
        });
      } else {
        newPartners[index] = {
          ...newPartners[index],
          [field]: value
        };
      }
      return newPartners;
    });
  };

  const handleAddPartner = () => {
    setPartners(prevPartners => {
      const newPartners = [...prevPartners];
      
      // Se é o segundo sócio, ajustar percentuais (50/50)
      if (newPartners.length === 1) {
        newPartners[0] = { ...newPartners[0], ownership_percentage: 50 };
      }
      
      newPartners.push({
        lawyer_id: '',
        partnership_type: '',
        ownership_percentage: newPartners.length === 1 ? 50 : 0,
        is_managing_partner: false
      });
      
      return newPartners;
    });
  };

  const handleRemovePartner = (index: number) => {
    if (partners.length === 1) return;
    setPartners(prevPartners => {
      const newPartners = prevPartners.filter((_, i) => i !== index);
      // Ajustar percentuais se ficou com 2 sócios
      if (newPartners.length === 2) {
        newPartners[0].ownership_percentage = 50;
        newPartners[1].ownership_percentage = 50;
      }
      return newPartners;
    });
  };

  // Função para filtrar advogados disponíveis (remove os já selecionados)
  const getAvailableLawyers = (currentIndex: number) => {
    const selectedLawyerIds = partners
      .map((partner, index) => index !== currentIndex ? partner.lawyer_id : null)
      .filter(id => id && id !== '');
    
    return adminsList.filter(admin => !selectedLawyerIds.includes(admin.id));
  };

  // Função para calcular total de percentuais
  const getTotalPercentage = () => {
    return partners.reduce((total, partner) => total + (partner.ownership_percentage || 0), 0);
  };

  // Função para validar se passou de 100%
  const isOverPercentage = () => {
    const total = getTotalPercentage();
    return total > 100;
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
    
    // Buscar configurações do sistema
    const fetchSystemSettings = async () => {
      try {
        const wage = await getMinimumWage();
        const ceiling = await getINSSCeiling();
        setMinimumWage(wage);
        setInssCeiling(ceiling);
      } catch (error) {
        console.error('Erro ao buscar configurações do sistema:', error);
        // Manter valores padrão
      }
    };
    
    fetchSystemSettings();
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
      const form = dataToEdit?.data?.attributes;

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
      handleDataForm();
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
                      loading={officeTypes.length === 0}
                      loadingText="Carregando tipos de escritório..."
                      getOptionLabel={option =>
                        option && option.attributes ? option.attributes.description : ''
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          placeholder="Selecione o Tipo de Escritório"
                          size="small"
                          error={!!errors.office_type}
                          helperText={errors.office_type}
                          FormHelperTextProps={{ className: 'ml-2' }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {officeTypes.length === 0 ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
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
                      handleInputChange={e => {
                        e.target.value = cnpjMask(e.target.value);
                        handleInputChange(e);
                      }}
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
                    handleInputChange={e => {
                      e.target.value = cepMask(e.target.value);
                      handleInputChange(e);
                    }}
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
                          handleInputChange={(e: any) => {
                            e.target.value = phoneMask(e.target.value);
                            handleContactChange(index, e.target.value, 'phoneInputFields');
                          }}
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

          {/* Seção de Sócios */}
          <Flex>
            <Box width={'300px'}>
              <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                {'Sócios do Escritório'}
              </Typography>
            </Box>

            <Box style={{ flex: 1 }}>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
                {partners.map((partner, index) => (
                  <Box key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, mb: 2 }}>
                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={1}>
                      <Typography variant="h6">Sócio {index + 1}</Typography>
                      {partners.length > 1 && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRemovePartner(index)}
                        >
                          <IoMdTrash />
                        </Button>
                      )}
                    </Box>
                    
                    <Box display={'flex'} gap={'16px'} mb={2}>
                      <Box flex={2}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Advogado</Typography>
                        <Autocomplete
                          value={
                            partner.lawyer_id 
                              ? adminsList.find(admin => admin.id === partner.lawyer_id) || null
                              : null
                          }
                          options={getAvailableLawyers(index)}
                          loading={adminsList.length === 0}
                          loadingText="Carregando advogados..."
                          getOptionLabel={(option) => 
                            option && option.attributes 
                              ? `${option.attributes.name} ${option.attributes.last_name}`
                              : ''
                          }
                          onChange={(event, value) => handlePartnerChange(index, 'lawyer_id', value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione o Advogado"
                              size="small"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {adminsList.length === 0 ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          noOptionsText="Nenhum advogado disponível"
                        />
                      </Box>
                      
                      <Box flex={1}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Função</Typography>
                        <Autocomplete
                          value={partnershipTypes.find(type => type.value === partner.partnership_type) || null}
                          options={partnershipTypes}
                          getOptionLabel={(option) => option.label}
                          onChange={(event, value) => handlePartnerChange(index, 'partnership_type', value?.value || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione a Função"
                              size="small"
                            />
                          )}
                          noOptionsText="Nenhuma função encontrada"
                        />
                      </Box>
                      
                      <Box flex={1}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Participação (%)</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TextField
                            size="small"
                            type="number"
                            value={partner.ownership_percentage || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                handlePartnerChange(index, 'ownership_percentage', 0);
                              } else {
                                handlePartnerChange(index, 'ownership_percentage', parseFloat(value));
                              }
                            }}
                            placeholder="0"
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            sx={{ width: '80px' }}
                          />
                          <Typography variant="body2">%</Typography>
                        </Box>
                        
                        {/* Slider para ajuste visual - só aparece quando há 2 sócios */}
                        {partners.length === 2 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="textSecondary" gutterBottom>
                              Ajuste proporcional
                            </Typography>
                            <Slider
                              value={partner.ownership_percentage}
                              onChange={(_, value) => handlePartnerChange(index, 'ownership_percentage', value)}
                              min={0}
                              max={100}
                              step={1}
                              size="small"
                              valueLabelDisplay="auto"
                              valueLabelFormat={(value) => `${value}%`}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Campo Sócio Administrador - só para sócios */}
                    {partner.partnership_type === 'socio' && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Sócio Administrador
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id={`managing-partner-${index}`}
                            checked={partner.is_managing_partner}
                            onChange={(e) => handlePartnerChange(index, 'is_managing_partner', e.target.checked)}
                            style={{ marginRight: '8px' }}
                          />
                          <label htmlFor={`managing-partner-${index}`}>
                            Este sócio é administrador
                          </label>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
                
                {/* Aviso quando percentual excede 100% */}
                {isOverPercentage() && (
                  <Box 
                    sx={{ 
                      backgroundColor: '#fff3cd', 
                      border: '1px solid #ffeaa7', 
                      borderRadius: '4px', 
                      p: 2, 
                      mb: 2 
                    }}
                  >
                    <Typography variant="body2" color="#856404">
                      ⚠️ O total de participação ({getTotalPercentage()}%) excede 100%. 
                      Ajuste as porcentagens para que somem no máximo 100%.
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<IoAddCircleOutline />}
                    onClick={handleAddPartner}
                    disabled={adminsList.length <= partners.length}
                    sx={{ 
                      alignSelf: 'flex-start',
                      opacity: adminsList.length <= partners.length ? 0.6 : 1
                    }}
                  >
                    Adicionar Sócio
                  </Button>
                  
                  {adminsList.length <= partners.length && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        fontStyle: 'italic' 
                      }}
                    >
                      Cadastre mais advogados para alterar seu quadro societário.{' '}
                      <Link 
                        href="http://localhost:3001/cadastrar?type=usuario" 
                        target="_blank"
                        sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Cadastrar novo usuário
                      </Link>
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Flex>

          <Divider />

          {/* Seção Distribuição de Lucros */}
          <Flex>
            <Box width={'300px'}>
              <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                {'Distribuição de Lucros'}
              </Typography>
            </Box>

            <Box style={{ flex: 1 }}>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Como será a distribuição de lucros?
                </Typography>
                
                <Box display="flex" gap={2} mb={2}>
                  <Box display="flex" alignItems="center">
                    <input
                      type="radio"
                      id="proportional"
                      name="profit-distribution"
                      value="proportional"
                      checked={profitDistribution === 'proportional'}
                      onChange={(e) => setProfitDistribution(e.target.value as 'proportional')}
                      style={{ marginRight: '8px' }}
                    />
                    <label htmlFor="proportional">Proporcional à participação</label>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <input
                      type="radio"
                      id="disproportional"
                      name="profit-distribution"
                      value="disproportional"
                      checked={profitDistribution === 'disproportional'}
                      onChange={(e) => setProfitDistribution(e.target.value as 'disproportional')}
                      style={{ marginRight: '8px' }}
                    />
                    <label htmlFor="disproportional">Desproporcional</label>
                  </Box>
                </Box>

                {profitDistribution === 'proportional' && (
                  <Box 
                    sx={{ 
                      backgroundColor: '#f0f8ff', 
                      border: '1px solid #add8e6', 
                      borderRadius: '4px', 
                      p: 2 
                    }}
                  >
                    <Typography variant="body2" color="#2e5a87">
                      ℹ️ Os lucros serão distribuídos proporcionalmente à participação de cada sócio.
                    </Typography>
                    
                    {/* Visualização das porcentagens atuais */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Distribuição atual:
                      </Typography>
                      {partners.map((partner, index) => (
                        partner.lawyer_name && (
                          <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2">
                              {partner.lawyer_name}:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {partner.ownership_percentage}%
                            </Typography>
                          </Box>
                        )
                      ))}
                    </Box>
                  </Box>
                )}

                {profitDistribution === 'disproportional' && (
                  <Box 
                    sx={{ 
                      backgroundColor: '#fff8dc', 
                      border: '1px solid #daa520', 
                      borderRadius: '4px', 
                      p: 2 
                    }}
                  >
                    <Typography variant="body2" color="#b8860b">
                      ⚠️ Distribuição desproporcional será definida de acordo com cada trabalho/processo.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Flex>

          <Divider />

          {/* Seção Contrato Social */}
          <Flex>
            <Box width={'300px'}>
              <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                {'Contrato Social'}
              </Typography>
            </Box>

            <Box style={{ flex: 1 }}>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Deseja criar um contrato social?
                </Typography>
                
                <Box display="flex" alignItems="center">
                  <input
                    type="checkbox"
                    id="create-social-contract"
                    checked={createSocialContract}
                    onChange={(e) => setCreateSocialContract(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor="create-social-contract">
                    Sim, desejo criar um contrato social
                  </label>
                </Box>

                {createSocialContract && (
                  <Box 
                    sx={{ 
                      backgroundColor: '#f0f8ff', 
                      border: '1px solid #add8e6', 
                      borderRadius: '4px', 
                      p: 2 
                    }}
                  >
                    <Typography variant="body2" color="#2e5a87">
                      ℹ️ A lógica para criação do contrato social será implementada posteriormente.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Flex>

          <Divider />

          {/* Seção Pro-Labore */}
          <Flex>
            <Box width={'300px'}>
              <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                {'Pro-Labore'}
              </Typography>
            </Box>

            <Box style={{ flex: 1 }}>
              <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Os sócios retirarão pro-labore?
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <input
                    type="checkbox"
                    id="partners-pro-labore"
                    checked={partnersWithProLabore}
                    onChange={(e) => setPartnersWithProLabore(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor="partners-pro-labore">
                    Sim, os sócios retirarão pro-labore
                  </label>
                </Box>

                {partnersWithProLabore && (
                  <Box>
                    <Box 
                      sx={{ 
                        backgroundColor: '#f0f8ff', 
                        border: '1px solid #add8e6', 
                        borderRadius: '4px', 
                        p: 2,
                        mb: 2
                      }}
                    >
                      <Typography variant="body2" color="#2e5a87">
                        ℹ️ <strong>Faixas de Valor:</strong>
                      </Typography>
                      <Typography variant="caption" color="#2e5a87" sx={{ display: 'block', mt: 0.5 }}>
                        • Salário Mínimo: R$ {minimumWage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="caption" color="#2e5a87" sx={{ display: 'block' }}>
                        • Teto INSS: R$ {inssCeiling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="caption" color="#2e5a87" sx={{ display: 'block', mt: 1 }}>
                        Valor R$ 0,00 = sócio não receberá pro-labore
                      </Typography>
                    </Box>

                    {/* Pro-labore para todos os sócios */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Valores de Pro-Labore por Sócio:
                      </Typography>
                      
                      {partners.map((partner, index) => (
                        partner.lawyer_name && (
                          <Box key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {partner.lawyer_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {partnershipTypes.find(type => type.value === partner.partnership_type)?.label || partner.partnership_type}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="body2" sx={{ minWidth: '120px' }}>
                                Pro-Labore:
                              </Typography>
                              <TextField
                                type="number"
                                size="small"
                                value={partner.pro_labore_amount || ''}
                                onChange={(e) => handlePartnerChange(index, 'pro_labore_amount', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                inputProps={{ min: 0, step: 0.01 }}
                                error={!!proLaboreErrors[index]}
                                InputProps={{
                                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>R$</Typography>
                                }}
                              />
                            </Box>
                            
                            {proLaboreErrors[index] && (
                              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                                ⚠️ {proLaboreErrors[index]}
                              </Typography>
                            )}
                            
                            {!proLaboreErrors[index] && (partner.pro_labore_amount === 0) && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                                ✓ Este sócio não receberá pro-labore
                              </Typography>
                            )}
                            
                            {!proLaboreErrors[index] && (partner.pro_labore_amount > 0) && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                                ✓ Valor válido
                              </Typography>
                            )}
                          </Box>
                        )
                      ))}
                      
                      {partners.filter(p => p.lawyer_name).length === 0 && (
                        <Box 
                          sx={{ 
                            backgroundColor: '#fff8dc', 
                            border: '1px solid #daa520', 
                            borderRadius: '4px', 
                            p: 2 
                          }}
                        >
                          <Typography variant="body2" color="#b8860b">
                            Adicione e selecione sócios para definir os valores de pro-labore.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Flex>

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
                      loading={adminsList.length === 0}
                      loadingText="Carregando administradores..."
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
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {adminsList.length === 0 ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
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
