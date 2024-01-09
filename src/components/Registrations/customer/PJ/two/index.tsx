import React, {
  useState,
  useEffect,
  ChangeEvent,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { Flex, colors } from '@/styles/globals';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Container, ColumnContainer } from '../styles';
import { animateScroll as scroll } from 'react-scroll';
import { z } from 'zod';

import { ICustomerProps } from '@/interfaces/ICustomer';
import { getAllCustomers } from '@/services/customers';
import { CustomerContext } from '@/contexts/CustomerContext';
import { TextField, Box, Autocomplete, Typography } from '@mui/material';
import { Notification } from '@/components';

export interface IRefPJCustomerStepTwoProps {
  handleSubmitForm: () => void;
}

interface IStepTwoProps {
  nextStep: () => void;
  editMode: boolean;
}

const stepTwoSchema = z.object({
  phones_attributes: z.array(
    z.object({
      phone_number: z.string().optional(),
    }),
  ),
  emails_attributes: z.array(
    z.object({
      email: z.string().optional(),
    }),
  ),
});

const PJCustomerStepTwo: ForwardRefRenderFunction<IRefPJCustomerStepTwoProps, IStepTwoProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerProps | null>(null);

  const [customerId, setCustomerId] = useState<number | null>(null);
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

      if (parsedData.represent_attributes)
        setCustomerId(parsedData.represent_attributes.profile_admin_id);

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
      if (!customerId) throw new Error('Representante não pode estar vazio.');

      if (formData.phoneInputFields.some(field => field.phone_number.trim() === '')) {
        throw new Error('Telefone não pode estar vazio.');
      }

      if (formData.emailInputFields.some(field => field.email.trim() === '')) {
        throw new Error('E-mail não pode estar vazio.');
      }

      if (editMode) {
        const data = {
          represent_attributes: {
            profile_admin_id: customerId,
          },
          phones_attributes: formData.phoneInputFields,
          emails_attributes: formData.emailInputFields,
        };

        customerForm.data.attributes.represent_attributes = {
          ...customerForm.data.attributes.represent,
          profile_admin_id: customerId,
        };
        customerForm.data.attributes.phones_attributes = formData.phoneInputFields;
        customerForm.data.attributes.emails_attributes = formData.emailInputFields;

        stepTwoSchema.parse(customerForm.data.attributes);

        saveDataLocalStorage(data);
        setCustomerForm(customerForm);
        nextStep();
        return;
      }

      const data = {
        ...customerForm,
        represent_attributes: {
          profile_admin_id: customerId,
        },
        phones_attributes: formData.phoneInputFields,
        emails_attributes: formData.emailInputFields,
      };

      stepTwoSchema.parse(data);

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

  const handleSelectedCustomer = (customerId: any) => {
    if (customerId) {
      setCustomerId(Number(customerId.id));
    } else {
      setCustomerId(null);
    }
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    const getCustomers = async () => {
      const response = await getAllCustomers();
      setCustomersList(response.data);
    };

    getCustomers();
  }, []);

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        setCustomerId(attributes.represent ? attributes.represent.profile_admin_id : null);

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
  }, [customerForm]);

  useEffect(() => {
    if (customerId && customersList.length > 0) {
      const customer = customersList.find(customer => Number(customer.id) === customerId);

      customer ? setSelectedCustomer(customer) : setSelectedCustomer(null);
    }
  }, [customerId, customersList]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, []);

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

      <Container>
        <Box maxWidth={'600px'}>
          <Flex style={{ flexDirection: 'column', flex: 1, marginBottom: '16px' }}>
            <Typography variant="h6" sx={{ marginBottom: '8px' }}>
              {'Representante'}
            </Typography>
            <Autocomplete
              options={customersList}
              value={selectedCustomer || null}
              getOptionLabel={option => option.attributes.name || ''}
              renderInput={params => (
                <TextField placeholder="Selecione um Representante" {...params} size="small" />
              )}
              sx={{ backgroundColor: 'white', zIndex: 1 }}
              noOptionsText="Nenhum Representante Encontrado"
              onChange={(event, value) => handleSelectedCustomer(value)}
            />
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
