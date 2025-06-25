import {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  ChangeEvent,
  useEffect,
} from 'react';

import { colors } from '@/styles/globals';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Container, ColumnContainer } from '../styles';
import { Box, Typography } from '@mui/material';
import { CustomerContext } from '@/contexts/CustomerContext';
import { Notification } from '@/components';
import { IoMdTrash } from 'react-icons/io';
import { phoneMask } from '@/utils/masks';
import { z } from 'zod';
import { isValidEmail, isValidPhoneNumber } from '@/utils/validator';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import { ZodFormError, ZodFormErrors } from '@/types/zod';
import CustomTooltip from '@/components/Tooltip';
import { MdOutlineInfo } from 'react-icons/md';

export interface IRefPFCustomerStepThreeProps {
  handleSubmitForm: () => void;
}

interface IStepThreeProps {
  nextStep: () => void;
  editMode: boolean;
}

const stepThreeSchema = z.object({
  phone_numbers: z
    .array(
      z
        .string({ required_error: 'Telefone é um campo obrigatório.' })
        .min(1, 'Telefone é um campo obrigatório.')
        .refine(isValidPhoneNumber, { message: 'Número de telefone inválido.' }),
    )
    .nonempty('Pelo menos um número de telefone é necessário.'),
  emails: z
    .array(
      z
        .string({ required_error: 'E-mail é um campo obrigatório.' })
        .min(1, 'E-mail é um campo obrigatório.')
        .refine(isValidEmail, { message: 'E-mail inválido.' }),
    )
    .nonempty('Pelo menos um e-mail é necessário.'),
});

const PFCustomerStepThree: ForwardRefRenderFunction<
  IRefPFCustomerStepThreeProps,
  IStepThreeProps
> = ({ nextStep, editMode }, ref) => {
  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext(CustomerContext);
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
            phone_number: phoneMask(value),
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

  const handleFormError = (error: { issues: ZodFormError[] }) => {
    const newErrors = error.issues ?? [];
    setMessage('Corrija os erros no formulário.');
    setType('error');
    setOpenSnackbar(true);
    const result: ZodFormErrors = {};

    // Loop through the errors and process them
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
      return errors[field][index];
    }
    return null;
  };

  const handleSubmitForm = () => {
    const validatePhoneDuplicate = formData.phoneInputFields.map((phone, index) => {
      const phone_number = phone.phone_number.replace(/\D/g, '');
      const phoneIndex = formData.phoneInputFields.findIndex(
        (phone, i) => phone.phone_number.replace(/\D/g, '') === phone_number && i !== index,
      );

      return phoneIndex !== -1;
    });

    if (validatePhoneDuplicate.includes(true)) {
      setMessage('Telefone duplicado.');
      setType('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      stepThreeSchema.parse({
        phone_numbers: formData.phoneInputFields.map(field => field.phone_number),
        emails: formData.emailInputFields.map(field => field.email),
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

        setNewCustomerForm({
          ...newCustomerForm,
          ...data,
        });

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
    } catch (err: any) {
      handleFormError(err);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data?.attributes;

      if (attributes) {
        setFormData(prevData => ({
          ...prevData,
          phoneInputFields: attributes.phones?.length ? attributes.phones : [{ phone_number: '' }], // Ensure at least one empty phone input
          emailInputFields: attributes.emails?.length ? attributes.emails : [{ email: '' }], // Ensure at least one empty email input
        }));
      } else {
        // Fallback in case attributes are undefined
        setFormData({
          phoneInputFields: [{ phone_number: '' }],
          emailInputFields: [{ email: '' }],
        });
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, []);

  const handleRemoveContact = (removeIndex: number, inputArrayName: keyof typeof formData) => {
    if (inputArrayName === 'phoneInputFields') {
      if (formData.phoneInputFields.length === 1) return;

      const updatedEducationals = [...formData.phoneInputFields];
      updatedEducationals.splice(removeIndex, 1);
      setFormData(prevData => ({
        ...prevData,
        phoneInputFields: updatedEducationals,
      }));
    }

    if (inputArrayName === 'emailInputFields') {
      if (formData.emailInputFields.length === 1) return;

      const updatedEducationals = [...formData.emailInputFields];
      updatedEducationals.splice(removeIndex, 1);
      setFormData(prevData => ({
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

      <Container>
        <div style={{ display: 'flex', gap: '16px' }}>
          <ColumnContainer>
            <Box>
              <Typography style={{ marginBottom: '8px' }} variant="h6">
                {'Telefone *'}
              </Typography>
              {formData.phoneInputFields.map((inputValue, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '8px',
                    gap: '6px',
                  }}
                >
                  <div className="flex flex-row gap-1">
                    <CustomTextField
                      formData={formData}
                      customValue={inputValue.phone_number}
                      handleInputChange={(e: any) =>
                        handleInputChange(index, e.target.value, 'phoneInputFields')
                      }
                      name="phone_number"
                      placeholder="Insira um número de telefone"
                      errorMessage={getErrorMessage(index, 'phone_numbers')}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveContact(index, 'phoneInputFields');
                      }}
                    >
                      <div
                        className={`flex  ${formData.phoneInputFields.length > 1 ? '' : 'hidden'}`}
                      >
                        <IoMdTrash size={20} color="#a50000" />
                      </div>
                    </button>
                  </div>
                  {index === formData.phoneInputFields.length - 1 && (
                    <button
                      id="add-phone"
                      type="button"
                      className="flex items-center w-fit self-end"
                      onClick={() => handleAddInput('phoneInputFields')}
                    >
                      <IoAddCircleOutline
                        className={`cursor-pointer ml-auto ${
                          formData.phoneInputFields.length > 1 ? 'mr-6' : ''
                        }`}
                        color={colors.quartiary}
                        size={20}
                      />
                    </button>
                  )}
                </div>
              ))}
            </Box>
          </ColumnContainer>
          <ColumnContainer>
            <Box>
              <div className="flex flex-row justify-between items-center">
                <Typography style={{ marginBottom: '8px' }} variant="h6">
                  {'Email *'}
                </Typography>
                <CustomTooltip
                  title="Este será utilizado para o acesso ao cadastro do sistema."
                  placement="right"
                >
                  <span
                    aria-label="Email de Acesso"
                    style={{
                      display: 'flex',
                    }}
                  >
                    <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
                  </span>
                </CustomTooltip>
              </div>
              {formData &&
                formData.emailInputFields.map((inputValue, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '8px',
                      gap: '6px',
                    }}
                  >
                    <div className="flex flex-row gap-1">
                      <CustomTextField
                        formData={formData}
                        name="email"
                        customValue={inputValue.email}
                        placeholder="Insira um e-mail"
                        errorMessage={getErrorMessage(index, 'emails')}
                        handleInputChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(index, e.target.value, 'emailInputFields')
                        }
                        required
                      />

                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveContact(index, 'emailInputFields');
                        }}
                      >
                        <div
                          className={`flex  ${
                            formData.emailInputFields.length > 1 ? '' : 'hidden'
                          }`}
                        >
                          <IoMdTrash size={20} color="#a50000" />
                        </div>
                      </button>
                    </div>

                    {index === formData.emailInputFields.length - 1 && (
                      <button
                        id="add-email"
                        type="button"
                        className="flex items-center w-fit self-end"
                        onClick={() => handleAddInput('emailInputFields')}
                      >
                        <IoAddCircleOutline
                          className={`cursor-pointer ml-auto ${
                            formData.emailInputFields.length > 1 ? 'mr-6' : ''
                          }`}
                          color={colors.quartiary}
                          size={20}
                        />
                      </button>
                    )}
                  </div>
                ))}
            </Box>
          </ColumnContainer>
        </div>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepThree);
