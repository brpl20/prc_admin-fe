import React, {
  useState,
  useEffect,
  ChangeEvent,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { DescriptionText, colors } from '@/styles/globals';
import { IoAddCircleOutline } from 'react-icons/io5';
import { IoMdTrash } from 'react-icons/io';
import { phoneMask } from '@/utils/masks';

import { Container, ColumnContainer } from '../styles';
import { animateScroll as scroll } from 'react-scroll';
import { z } from 'zod';

import { CustomerContext } from '@/contexts/CustomerContext';
import { TextField, Box, Autocomplete, Typography, Button } from '@mui/material';
import { Notification } from '@/components';
import { IAdminProps } from '@/interfaces/IAdmin';
import { getAllProfileCustomer } from '@/services/customers';
import RepresentativeModal from '../../representative/representativeModal';
import { MdOutlineAddCircle } from 'react-icons/md';
import { isValidEmail, isValidPhoneNumber } from '@/utils/validator';
import { ZodFormError, ZodFormErrors } from '@/types/zod';
import CustomTextField from '@/components/FormInputFields/CustomTextField';

export interface IRefPJCustomerStepTwoProps {
  handleSubmitForm: () => void;
}

interface IStepTwoProps {
  nextStep: () => void;
  editMode: boolean;
}

const stepTwoSchema = z.object({
  profile_admin: z.string().min(1, { message: 'Representante é um campo obrigatório.' }),
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

const PJCustomerStepTwo: ForwardRefRenderFunction<IRefPJCustomerStepTwoProps, IStepTwoProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [isModalRegisterRepresentativeOpen, setIsModalRegisterRepresentativeOpen] = useState(false);

  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext(CustomerContext);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [profileAdmin, setProfileAdmin] = useState('' as any);

  const [formData, setFormData] = useState({
    phones_attributes: [{ phone_number: '' }],
    emails_attributes: [{ email: '' }],
  });

  const handleInputChange = (
    index: number,
    value: string,
    inputArrayName: keyof typeof formData,
  ) => {
    setFormData(prevData => {
      const newInputFields = [...prevData[inputArrayName]];

      if (inputArrayName === 'phones_attributes') {
        if (newInputFields[index]) {
          newInputFields[index] = {
            ...newInputFields[index],
            phone_number: phoneMask(value),
          };
        } else {
          newInputFields.push({ phone_number: value });
        }
      } else if (inputArrayName === 'emails_attributes') {
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
        [inputArrayName === 'phones_attributes' ? 'phone_number' : 'email']: '',
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
        customer => customer.id == parsedData.represent_attributes.representor_id,
      );

      if (customer) {
        setProfileAdmin(customer);
      }

      if (parsedData.phones_attributes) {
        setFormData(prevData => ({
          ...prevData,
          phones_attributes: parsedData.phones_attributes,
        }));
      }

      if (parsedData.emails_attributes) {
        setFormData(prevData => ({
          ...prevData,
          emails_attributes: parsedData.emails_attributes,
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
        profile_admin: profileAdmin?.id || '',
        phone_numbers: formData.phones_attributes.map(field => field.phone_number),
        emails: formData.emails_attributes.map(field => field.email),
      });

      if (editMode) {
        const data = {
          represent_attributes: {
            representor_id: Number(profileAdmin?.id),
          },
          phones_attributes: formData.phones_attributes,
          emails_attributes: formData.emails_attributes,
        };

        customerForm.data.attributes.represent_attributes = {
          ...customerForm.data.attributes.represent,
          representor_id: Number(profileAdmin?.id),
        };

        customerForm.data.attributes.default_phone = formData.phones_attributes[0].phone_number;
        customerForm.data.attributes.phones_attributes = formData.phones_attributes;
        customerForm.data.attributes.emails_attributes = formData.emails_attributes;

        saveDataLocalStorage(data);
        setCustomerForm(customerForm);

        setNewCustomerForm({
          ...newCustomerForm,
          ...data,
        });

        nextStep();
        return;
      }

      const data = {
        ...customerForm,
        represent_attributes: {
          representor_id: Number(profileAdmin?.id),
        },
        phones_attributes: formData.phones_attributes,
        emails_attributes: formData.emails_attributes,
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

  const handleSelectedCustomer = (admin: IAdminProps) => {
    if (errors.profile_admin) {
      delete errors.profile_admin;
      setErrors(errors);
    }

    if (admin) {
      setProfileAdmin(admin);
    } else {
      setProfileAdmin('');
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  const getCustomers = async (newId?: number) => {
    const allProfileCustomers = await getAllProfileCustomer('');
    const response = allProfileCustomers.data;

    const representors = response.filter(
      (customer: any) => customer.attributes.customer_type === 'representative',
    );

    setCustomersList(representors);

    if (newId) {
      const newRepresentative = representors.find((customer: any) => customer.id == newId);
      handleSelectedCustomer(newRepresentative);
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes;

      if (attributes) {
        if (attributes.represent) {
          const customer = customersList.find(
            customer => customer.id == attributes.represent.representor_id,
          );

          if (customer) {
            setProfileAdmin(customer);
          }
        }

        setFormData(prevData => ({
          ...prevData,
          phones_attributes:
            attributes.phones && attributes.phones.length > 0
              ? attributes.phones
              : [{ phone_number: '' }],
          emails_attributes:
            attributes.emails && attributes.emails.length > 0 ? attributes.emails : [{ email: '' }],
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

  const handleRemoveContact = (removeIndex: number, inputArrayName: keyof typeof formData) => {
    if (inputArrayName === 'phones_attributes') {
      if (formData.phones_attributes.length === 1) return;

      const updatedEducationals = [...formData.phones_attributes];
      updatedEducationals.splice(removeIndex, 1);
      setFormData(prevData => ({
        ...prevData,
        phones_attributes: updatedEducationals,
      }));
    }

    if (inputArrayName === 'emails_attributes') {
      if (formData.emails_attributes.length === 1) return;

      const updatedEducationals = [...formData.emails_attributes];
      updatedEducationals.splice(removeIndex, 1);
      setFormData(prevData => ({
        ...prevData,
        emails_attributes: updatedEducationals,
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

      {isModalRegisterRepresentativeOpen && (
        <RepresentativeModal
          pageTitle="Cadastro de Representante"
          isOpen={isModalRegisterRepresentativeOpen}
          handleClose={() => setIsModalRegisterRepresentativeOpen(false)}
          handleRegistrationFinished={getCustomers}
        />
      )}
      <Container>
        <Box maxWidth={'600px'}>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, maxWidth: '292px' }}>
              <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                {'Representante'}
              </Typography>
              <Autocomplete
                limitTags={1}
                className="bg-white z-1"
                options={customersList}
                getOptionLabel={(option: any) => {
                  const name = option?.attributes?.name ?? '';
                  const lastName = option?.attributes?.last_name ?? '';
                  const fullName = `${name} ${lastName}`.trim();

                  const maxLength = 35;
                  return fullName.length > maxLength
                    ? fullName.slice(0, maxLength) + '...'
                    : fullName;
                }}
                renderInput={params => (
                  <TextField
                    variant="outlined"
                    error={!!getErrorMessage(0, 'profile_admin')}
                    type="text"
                    {...params}
                    size="small"
                    placeholder={`Selecione um Representante`}
                    helperText={getErrorMessage(0, 'profile_admin')}
                    FormHelperTextProps={{ className: 'ml-2' }}
                  />
                )}
                noOptionsText="Não Encontrado"
                onChange={(event, value) => handleSelectedCustomer(value as IAdminProps)}
                value={profileAdmin || null}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: '38px',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsModalRegisterRepresentativeOpen(true)}
                sx={{
                  backgroundColor: colors.quartiary,
                  color: colors.white,
                  width: '292px',
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
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <ColumnContainer>
              <Box>
                <Typography style={{ marginBottom: '8px' }} variant="h6">
                  {'Telefone'}
                </Typography>

                {formData.phones_attributes.map((inputValue, index) => (
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
                        name="phone_number"
                        placeholder="Informe o Telefone"
                        handleInputChange={(e: any) => {
                          handleInputChange(index, e.target.value, 'phones_attributes');
                        }}
                        errorMessage={getErrorMessage(index, 'phone_numbers')}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveContact(index, 'phones_attributes');
                        }}
                      >
                        <div
                          className={`flex  ${
                            formData.phones_attributes.length > 1 ? '' : 'hidden'
                          }`}
                        >
                          <IoMdTrash size={20} color="#a50000" />
                        </div>
                      </button>
                    </div>

                    {index === formData.phones_attributes.length - 1 && (
                      <IoAddCircleOutline
                        className={`cursor-pointer ml-auto ${
                          formData.phones_attributes.length > 1 ? 'mr-6' : ''
                        }`}
                        onClick={() => handleAddInput('phones_attributes')}
                        color={colors.quartiary}
                        size={20}
                      />
                    )}
                  </div>
                ))}
              </Box>
            </ColumnContainer>
            <ColumnContainer>
              <Box>
                <Typography style={{ marginBottom: '8px' }} variant="h6">
                  {'E-mail'}
                </Typography>
                {formData.emails_attributes.map((inputValue, index) => (
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
                        customValue={inputValue.email}
                        name="email"
                        placeholder="Informe o Email"
                        handleInputChange={(e: any) => {
                          handleInputChange(index, e.target.value, 'emails_attributes');
                        }}
                        errorMessage={getErrorMessage(index, 'emails')}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveContact(index, 'emails_attributes');
                        }}
                      >
                        <div
                          className={`flex  ${
                            formData.emails_attributes.length > 1 ? '' : 'hidden'
                          }`}
                        >
                          <IoMdTrash size={20} color="#a50000" />
                        </div>
                      </button>
                    </div>

                    {index === formData.emails_attributes.length - 1 && (
                      <IoAddCircleOutline
                        className={`cursor-pointer ml-auto ${
                          formData.emails_attributes.length > 1 ? 'mr-6' : ''
                        }`}
                        onClick={() => handleAddInput('emails_attributes')}
                        color={colors.quartiary}
                        size={20}
                      />
                    )}
                  </div>
                ))}
              </Box>
            </ColumnContainer>
          </div>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(PJCustomerStepTwo);
