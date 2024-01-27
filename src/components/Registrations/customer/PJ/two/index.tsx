import React, {
  useState,
  useEffect,
  ChangeEvent,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { DescriptionText, Flex, colors } from '@/styles/globals';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Container, ColumnContainer } from '../styles';
import { animateScroll as scroll } from 'react-scroll';
import { z } from 'zod';

import { CustomerContext } from '@/contexts/CustomerContext';
import { TextField, Box, Autocomplete, Typography, Button } from '@mui/material';
import { Notification } from '@/components';
import { getAllAdmins } from '@/services/admins';
import { IAdminProps } from '@/interfaces/IAdmin';
import { getAllCustomers } from '@/services/customers';
import RepresentativeModal from '../../representative/representativeModal';
import { MdOutlineAddCircle } from 'react-icons/md';

export interface IRefPJCustomerStepTwoProps {
  handleSubmitForm: () => void;
}

interface IStepTwoProps {
  nextStep: () => void;
  editMode: boolean;
}

const stepTwoSchema = z.object({
  profile_admin: z.string().nonempty('Representante Obrigatório'),
  phone_number: z.string().nonempty('Telefone Obrigatório'),
  email: z.string().nonempty('Email Obrigatório'),
});

const PJCustomerStepTwo: ForwardRefRenderFunction<IRefPJCustomerStepTwoProps, IStepTwoProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [isModalRegisterRepresentativeOpen, setIsModalRegisterRepresentativeOpen] = useState(false);
  const [isRepresentativeFinished, setIsRepresentativeFinished] = useState(false);
  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [profileAdmin, setProfileAdmin] = useState('' as any);

  const [formData, setFormData] = useState({
    phoneInputFields: [{ phone_number: '' }],
    emailInputFields: [{ email: '' }],
  });

  const handleInputChange = (
    index: number,
    value: string,
    inputArrayName: keyof typeof formData,
  ) => {
    setFormData(prevData => {
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

  const handleAddInput = (inputArrayName: keyof typeof formData) => {
    setFormData(prevData => {
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

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PJ/Two');

    if (data) {
      const parsedData = JSON.parse(data);

      const customer = customersList.find(
        customer => customer.id == parsedData.represent_attributes.profile_admin_id,
      );

      if (customer) {
        setProfileAdmin(customer);
      }

      if (parsedData.phones_attributes) {
        setFormData(prevData => ({
          ...prevData,
          phoneInputFields: parsedData.phones_attributes,
        }));
      }

      if (parsedData.emails_attributes) {
        setFormData(prevData => ({
          ...prevData,
          emailInputFields: parsedData.emails_attributes,
        }));
      }
    }
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('PJ/Two', JSON.stringify(data));
  };

  const handleSubmitForm = () => {
    try {
      stepTwoSchema.parse({
        profile_admin: profileAdmin?.id,
        phone_number: formData.phoneInputFields[0].phone_number,
        email: formData.emailInputFields[0].email,
      });

      if (editMode) {
        const data = {
          represent_attributes: {
            profile_admin_id: Number(profileAdmin?.id),
          },
          phones_attributes: formData.phoneInputFields,
          emails_attributes: formData.emailInputFields,
        };

        customerForm.data.attributes.represent_attributes = {
          ...customerForm.data.attributes.represent,
          profile_admin_id: Number(profileAdmin?.id),
        };
        customerForm.data.attributes.phones_attributes = formData.phoneInputFields;
        customerForm.data.attributes.emails_attributes = formData.emailInputFields;

        saveDataLocalStorage(data);
        setCustomerForm(customerForm);
        nextStep();
        return;
      }

      const data = {
        ...customerForm,
        represent_attributes: {
          profile_admin_id: Number(profileAdmin?.id),
        },
        phones_attributes: formData.phoneInputFields,
        emails_attributes: formData.emailInputFields,
      };

      saveDataLocalStorage(data);
      setCustomerForm(data);
      nextStep();
    } catch (error: any) {
      handleFormError(error);
      scroll.scrollToTop({
        duration: 500,
        smooth: 'easeInOutQuart',
      });
    }
  };

  const handleFormError = (error: any) => {
    const newErrors = error.formErrors.fieldErrors;
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

  const handleSelectedCustomer = (admin: IAdminProps) => {
    if (admin) {
      setProfileAdmin(admin);
    } else {
      setProfileAdmin('');
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    const getCustomers = async () => {
      const allCustomers = await getAllCustomers();
      const response = allCustomers.data;

      const representors = response.filter(
        (customer: any) => customer.attributes.customer_type === 'representative',
      );
      setCustomersList(representors);
    };

    getCustomers();
  }, [isRepresentativeFinished]);

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        const customer = customersList.find(
          customer => customer.id == attributes.represent.profile_admin_id,
        );

        if (customer) {
          setProfileAdmin(customer);
        }

        setFormData(prevData => ({
          ...prevData,
          phoneInputFields: attributes.phones_attributes
            ? attributes.phones_attributes
            : attributes.phones,
          emailInputFields: attributes.emails_attributes
            ? attributes.emails_attributes
            : attributes.emails,
        }));
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm, customersList]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, [customersList]);

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

      {isModalRegisterRepresentativeOpen && (
        <RepresentativeModal
          pageTitle="Cadastro de Representante"
          isOpen={isModalRegisterRepresentativeOpen}
          handleClose={() => setIsModalRegisterRepresentativeOpen(false)}
          handleRegistrationFinished={() => setIsRepresentativeFinished(true)}
        />
      )}

      <Container>
        <Box maxWidth={'600px'}>
          <Flex
            style={{
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <Flex style={{ flexDirection: 'column', flex: 1, maxWidth: '292px' }}>
              <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                {'Representante'}
              </Typography>
              <Autocomplete
                limitTags={1}
                options={customersList}
                getOptionLabel={option => option?.attributes?.name ?? ''}
                renderInput={params => (
                  <TextField placeholder="Selecione um Representante" {...params} size="small" />
                )}
                sx={{ backgroundColor: 'white', zIndex: 1 }}
                noOptionsText="Nenhum Cliente Encontrado"
                onChange={(event, value) => handleSelectedCustomer(value as IAdminProps)}
                value={profileAdmin || null}
              />
            </Flex>
            <Flex>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsModalRegisterRepresentativeOpen(true)}
                sx={{
                  backgroundColor: colors.quartiary,
                  color: colors.white,
                  width: '292px',
                  marginTop: 'auto',
                  '&:hover': {
                    backgroundColor: colors.quartiaryHover,
                  },
                }}
              >
                <DescriptionText style={{ cursor: 'pointer' }} className="ml-8">
                  {'Adicionar Representante'}
                </DescriptionText>
                <MdOutlineAddCircle size={20} />
              </Button>
            </Flex>
          </Flex>
          <Flex style={{ gap: '16px' }}>
            <ColumnContainer>
              <Box>
                <Typography style={{ marginBottom: '8px' }} variant="h6">
                  {'Telefone'}
                </Typography>
                {formData.phoneInputFields.map((inputValue, index) => (
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
                        handleInputChange(index, e.target.value, 'phoneInputFields')
                      }
                      autoComplete="off"
                      error={!!errors.phone_number}
                    />
                    {index === formData.phoneInputFields.length - 1 && (
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
            </ColumnContainer>
            <ColumnContainer>
              <Box>
                <Typography style={{ marginBottom: '8px' }} variant="h6">
                  {'E-mail'}
                </Typography>
                {formData.emailInputFields.map((inputValue, index) => (
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
                      placeholder="Informe o Email"
                      value={inputValue.email || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(index, e.target.value, 'emailInputFields')
                      }
                      autoComplete="off"
                      error={!!errors.email}
                    />
                    {index === formData.emailInputFields.length - 1 && (
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
            </ColumnContainer>
          </Flex>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(PJCustomerStepTwo);
