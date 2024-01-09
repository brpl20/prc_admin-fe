import React, { useState, ChangeEvent, useEffect, useContext } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineAddCircle } from 'react-icons/md';

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
import { societyType } from '@/utils/constants';

import { Container, Title, DateContainer } from './styles';
import { colors, ContentContainer, DescriptionText } from '@/styles/globals';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Flex, Divider } from '@/styles/globals';

import { ICustomerProps } from '@/interfaces/ICustomer';
import { getAllCustomers } from '@/services/customers';
import { createOfficeType, getAllOfficeTypes } from '@/services/offices';
import { getCEPDetails } from '@/services/brasilAPI';
import { createOffice, updateOffice } from '@/services/offices';

import Router from 'next/router';
import { cepMask, cnpjMask } from '@/utils/masks';

import OfficeTypeModal from './officeTypeModal';
import { IAdminPropsAttributes } from '@/interfaces/IAdmin';

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
}

interface props {
  pageTitle: string;
  dataToEdit?: any;
}

const Office = ({ pageTitle, dataToEdit }: props) => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openOfficeTypeModal, setOpenOfficeTypeModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);
  const [officeTypes, setOfficeTypes] = useState<any[]>([]);
  const [selectedOfficeType, setSelectedOfficeType] = useState<any>({});
  const [selectedSocialType, setSelectedSocialType] = useState<any>({});

  const { setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const currentDate = dayjs();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

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
    try {
      if (selectedOfficeType.id === undefined) throw new Error('Selecione o Tipo de Escritório');
      if (!formData.name) throw new Error('Informe o Nome do Escritório');
      if (!formData.oab) throw new Error('Informe o Identificador OAB');
      if (!formData.cnpj_cpf) throw new Error('Informe o CNPJ/CPF');
      if (!formData.society_type) throw new Error('Informe o Tipo de Sociedade');
      if (selectedDate === undefined) throw new Error('Informe a Data de Função Exp. OAB');
      if (!formData.cep) throw new Error('Informe o CEP');
      if (!formData.address) throw new Error('Informe o Endereço');
      if (!formData.state) throw new Error('Informe o Estado');
      if (!formData.city) throw new Error('Informe a Cidade');
      if (!formData.number) throw new Error('Informe o Número');
      if (!formData.neighborhood) throw new Error('Informe o Bairro');
      if (!formData.webSite) throw new Error('Informe o Site');
      if (contactData.phoneInputFields.some(field => field.phone_number.trim() === '')) {
        throw new Error('Telefone não pode estar vazio.');
      }

      if (contactData.emailInputFields.some(field => field.email.trim() === '')) {
        throw new Error('E-mail não pode estar vazio.');
      }

      if (!formData.responsible_lawyer) {
        throw new Error('Selecione o Responsável pelo Escritório');
      }

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

        emails_attributes: contactData.emailInputFields,
        phones_attributes: contactData.phoneInputFields,
      };

      if (isEditing) {
        await updateOffice(dataToEdit.id, office);
        Router.push('/escritorios');
        return;
      } else {
        await createOffice(office);
        Router.push('/escritorios');
      }
    } catch (err) {
      handleFormError(err);
    }
  };

  const handleCreateOfficeType = async (description: string) => {
    const data = {
      office_type: {
        description,
      },
    };

    try {
      await createOfficeType(data);
      setOpenOfficeTypeModal(false);
      getOfficeTypes();

      setMessage('Tipo de Escritório criado com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
    } catch (error: any) {
      if (error.response.status === 422) {
        setMessage('Tipo de Escritório já existe!');
        setTypeMessage('error');
        setOpenSnackbar(true);
        return;
      }
      setMessage(error.message);
      setTypeMessage('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (name: keyof FormData, title: string, placeholderText: string) => (
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
            ? cnpjMask(formData.cnpj_cpf)
            : name === 'cep' && formData.cep
            ? cepMask(formData.cep)
            : formData[name] || ''
        }
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

  const getCustomers = async () => {
    const response = await getAllCustomers();
    setCustomersList(response.data);
  };

  const getOfficeTypes = async () => {
    const response = await getAllOfficeTypes();
    setOfficeTypes(response.data);
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setTypeMessage('error');
    setOpenSnackbar(true);
  };

  useEffect(() => {
    getCustomers();

    getOfficeTypes();
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
          setTypeMessage('error');
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
        }));

        setSelectedOfficeType({
          attributes: {
            description: form.office_type_description,
          },
        });

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
  }, [dataToEdit, customersList]);

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={typeMessage}
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

      {openOfficeTypeModal && (
        <OfficeTypeModal
          isOpen={openOfficeTypeModal}
          onClose={() => setOpenOfficeTypeModal(false)}
          handleSave={handleCreateOfficeType}
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
                        />
                      )}
                      sx={{ backgroundColor: 'white', zIndex: 1, width: '49%' }}
                      noOptionsText="Nenhum Tipo de Escritório Encontrado"
                      onChange={(event, value) => {
                        value ? setSelectedOfficeType(value) : setSelectedOfficeType('');
                      }}
                    />
                    <Flex style={{ flex: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenOfficeTypeModal(true)}
                        sx={{
                          backgroundColor: colors.quartiary,
                          color: colors.white,
                          width: '172px',
                          marginTop: 'auto',
                          '&:hover': {
                            backgroundColor: colors.quartiaryHover,
                          },
                        }}
                      >
                        <DescriptionText style={{ cursor: 'pointer' }} className="ml-8">
                          {'Adicionar Tipo'}
                        </DescriptionText>
                        <MdOutlineAddCircle size={20} />
                      </Button>
                    </Flex>
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
                    {renderInputField('name', 'Nome', 'Nome do Escritório')}
                    {renderInputField('oab', 'OAB', 'Identificador OAB')}
                  </Flex>

                  <Flex style={{ gap: '24px' }}>
                    {renderInputField('cnpj_cpf', 'CNPJ/CPF', 'Informe o CPF')}
                    {renderSelectField('Tipo da Sociedade', 'society_type', societyType)}
                  </Flex>

                  <Flex style={{ gap: '24px', width: '50%', marginRight: '24px' }}>
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
                  </Flex>
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
                  {renderInputField('cep', 'CEP', 'Informe o CEP')}
                  <Flex style={{ gap: '16px' }}>
                    {renderInputField('address', 'Endereço', 'Informe o Endereço')}
                    <Box maxWidth={'30%'}>{renderInputField('number', 'Número', 'N.º')}</Box>
                  </Flex>
                  {renderInputField('description', 'Complemento', 'Informe o Complemento')}
                </Box>

                <Box display={'flex'} flexDirection={'column'} gap={'16px'} flex={1}>
                  {renderInputField('neighborhood', 'Bairro', 'Informe o Estado')}
                  {renderInputField('city', 'Cidade', 'Informe a Cidade')}
                  {renderInputField('state', 'Estado', 'Informe o Estado')}
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
                      {'Responsavel pelo Escritório'}
                    </Typography>

                    <Autocomplete
                      limitTags={1}
                      id="multiple-limit-tags"
                      value={
                        formData.responsible_lawyer
                          ? customersList.find(
                              (lawyer: any) => lawyer.id == formData.responsible_lawyer,
                            )
                          : ''
                      }
                      options={customersList}
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

export default Office;
