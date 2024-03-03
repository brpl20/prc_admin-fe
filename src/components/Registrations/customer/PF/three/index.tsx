import React, {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  ChangeEvent,
  useEffect,
} from 'react';

import { Flex, colors } from '@/styles/globals';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Container, ColumnContainer } from '../styles';
import { Box, TextField, Typography } from '@mui/material';
import { CustomerContext } from '@/contexts/CustomerContext';
import { Notification } from '@/components';
import { z } from 'zod';

export interface IRefPFCustomerStepThreeProps {
  handleSubmitForm: () => void;
}

interface IStepThreeProps {
  nextStep: () => void;
  editMode: boolean;
}

const stepThreeSchema = z.object({
  phone_number: z.string().nonempty('Telefone Obrigatório'),
  email: z.string().nonempty('Email Obrigatório'),
});

const PFCustomerStepThree: ForwardRefRenderFunction<
  IRefPFCustomerStepThreeProps,
  IStepThreeProps
> = ({ nextStep, editMode }, ref) => {
  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
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

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PF/Three');

    if (data) {
      const parsedData = JSON.parse(data);

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
    localStorage.setItem('PF/Three', JSON.stringify(data));
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

  const handleSubmitForm = () => {
    try {
      stepThreeSchema.parse({
        phone_number: formData.phoneInputFields[0].phone_number,
        email: formData.emailInputFields[0].email,
      });

      if (editMode) {
        delete customerForm.data.attributes.phones;
        delete customerForm.data.attributes.emails;

        customerForm.data.attributes.phones_attributes = formData.phoneInputFields;
        customerForm.data.attributes.emails_attributes = formData.emailInputFields;

        const data = {
          phones_attributes: formData.phoneInputFields,
          emails_attributes: formData.emailInputFields,
        };

        saveDataLocalStorage(data);
        setCustomerForm(customerForm);
        nextStep();
        return;
      } else {
        const data = {
          ...customerForm,
          phones_attributes: formData.phoneInputFields,
          emails_attributes: formData.emailInputFields,
        };

        saveDataLocalStorage(data);

        setCustomerForm(data);
      }

      nextStep();
    } catch (err) {
      handleFormError(err);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;
      if (attributes) {
        setFormData(prevData => ({
          ...prevData,
          phoneInputFields: attributes.phones,
          emailInputFields: attributes.emails,
        }));
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm]);

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
        <Flex style={{ gap: '16px' }}>
          <ColumnContainer>
            <Box>
              <Typography style={{ marginBottom: '8px' }} variant="h6">
                {'Telefone'}
              </Typography>
              {formData.phoneInputFields &&
                formData.phoneInputFields.map((inputValue, index) => (
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
                      value={inputValue.phone_number}
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
              {formData &&
                formData.emailInputFields &&
                formData.emailInputFields.map((inputValue, index) => (
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
                      value={inputValue.email}
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
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepThree);
