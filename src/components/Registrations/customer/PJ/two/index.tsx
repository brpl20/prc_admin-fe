import React, {
  useState,
  useEffect,
  useContext,
  forwardRef,
  useCallback,
  useMemo,
  useImperativeHandle,
} from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { MdOutlineAddCircle } from 'react-icons/md';
import { animateScroll as scroll } from 'react-scroll';
import { z } from 'zod';
import Select from 'react-select';

import { DescriptionText, colors } from '@/styles/globals';
import { phoneMask } from '@/utils/masks';
import { isValidEmail, isValidPhoneNumber } from '@/utils/validator';
import { getAllProfileCustomer } from '@/services/customers';
import { CustomerContext } from '@/contexts/CustomerContext';
import { Notification } from '@/components';
import RepresentativeModal from '../../representative/representativeModal';
import CustomTextField from '@/components/FormInputFields/CustomTextField';
import { LoadingOverlay } from '@/components/Registrations/work/one/styles';
import { Container } from '../styles';
import { IoMdTrash } from 'react-icons/io';
import { IoAddCircleOutline } from 'react-icons/io5';

export interface IRefPJCustomerStepTwoProps {
  handleSubmitForm: () => void;
}

interface IStepTwoProps {
  nextStep: () => void;
  editMode: boolean;
}

interface ContactData {
  phones_attributes: Array<{ phone_number: string }>;
  emails_attributes: Array<{ email: string }>;
}

interface FormData extends ContactData {
  represent_attributes?: {
    representor_id: number;
  };
}

interface ProfileAdmin {
  id: string;
  attributes: {
    name: string;
    last_name: string;
    customer_type: string;
  };
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

const PJCustomerStepTwo = forwardRef<IRefPJCustomerStepTwoProps, IStepTwoProps>(
  ({ nextStep, editMode }, ref) => {
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
      open: false,
      message: '',
      type: 'success' as 'success' | 'error',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileAdmin, setProfileAdmin] = useState<ProfileAdmin | null>(null);
    const [customersList, setCustomersList] = useState<ProfileAdmin[]>([]);
    const [errors, setErrors] = useState<Record<string, any>>({});

    const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
      useContext(CustomerContext);

    const initialFormData: ContactData = useMemo(
      () => ({
        phones_attributes: [{ phone_number: '' }],
        emails_attributes: [{ email: '' }],
      }),
      [],
    );

    const [formData, setFormData] = useState<ContactData>(initialFormData);

    const getCustomers = useCallback(async (newId?: string) => {
      try {
        const response = await getAllProfileCustomer('');
        const representors = response.data.filter(
          (customer: ProfileAdmin) => customer.attributes.customer_type === 'representative',
        );

        setCustomersList(representors);

        if (newId) {
          const newRepresentative = representors.find((customer: any) => customer.id === newId);
          if (newRepresentative) {
            setProfileAdmin(newRepresentative);
          }
        }
      } catch (error) {
        showNotification('Erro ao carregar representantes', 'error');
      }
    }, []);

    useEffect(() => {
      getCustomers();
    }, []);

    useEffect(() => {
      if (customersList.length === 0) return;

      const localData = localStorage.getItem('PJ/Two');
      if (localData) {
        const parsedData: FormData = JSON.parse(localData);
        updateFormData(parsedData);
      } else if (customerForm?.data?.attributes) {
        updateFormDataFromCustomer();
      }

      setLoading(false);
    }, [customersList]);

    const updateFormData = useCallback(
      (data: FormData) => {
        if (data.represent_attributes?.representor_id) {
          const admin = customersList.find(
            c => c.id == String(data.represent_attributes?.representor_id),
          );
          setProfileAdmin(admin || null);
        }

        setFormData({
          phones_attributes: data.phones_attributes || initialFormData.phones_attributes,
          emails_attributes: data.emails_attributes || initialFormData.emails_attributes,
        });
      },
      [customersList, initialFormData],
    );

    const updateFormDataFromCustomer = useCallback(() => {
      const { attributes } = customerForm.data;
      const admin = customersList.find(c => c.id == String(attributes.represent?.representor_id));

      setProfileAdmin(admin || null);
      setFormData({
        phones_attributes: attributes.phones?.length
          ? attributes.phones
          : initialFormData.phones_attributes,
        emails_attributes: attributes.emails?.length
          ? attributes.emails
          : initialFormData.emails_attributes,
      });
    }, [customerForm, customersList, initialFormData]);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
      setNotification({ open: true, message, type });
    }, []);

    const handleFormError = useCallback(
      (error: unknown) => {
        showNotification('Corrija os erros no formulário.', 'error');

        if (error instanceof z.ZodError) {
          const newErrors: Record<string, any> = {};
          error.issues.forEach(err => {
            const [field, index] = err.path;
            if (!newErrors[field]) {
              newErrors[field] = [];
            }
            newErrors[field][index || 0] = err.message;
          });
          setErrors(newErrors);
        }

        scroll.scrollToTop({ duration: 500, smooth: 'easeInOutQuart' });
      },
      [showNotification],
    );

    const saveDataLocalStorage = useCallback((data: FormData) => {
      localStorage.setItem('PJ/Two', JSON.stringify(data));
    }, []);

    const handleInputChange = useCallback(
      (index: number, value: string, field: 'phones_attributes' | 'emails_attributes') => {
        setFormData(prev => {
          const newFields = [...prev[field]];
          const key = field === 'phones_attributes' ? 'phone_number' : 'email';

          if (newFields[index]) {
            newFields[index] = {
              ...newFields[index],
              [key]: field === 'phones_attributes' ? phoneMask(value) : value,
            };
          } else {
            newFields[index] =
              field === 'phones_attributes' ? { phone_number: phoneMask(value) } : { email: value };
          }

          return { ...prev, [field]: newFields };
        });

        const errorField = field === 'phones_attributes' ? 'phone_numbers' : 'emails';
        if (errors[errorField]?.[index]) {
          const newErrors = { ...errors };
          delete newErrors[errorField][index];
          if (Object.keys(newErrors[errorField]).length === 0) {
            delete newErrors[errorField];
          }
          setErrors(newErrors);
        }
      },
      [errors],
    );

    const handleAddInput = useCallback((field: 'phones_attributes' | 'emails_attributes') => {
      setFormData(prev => {
        const newFields = [...prev[field]];
        if (field === 'phones_attributes') {
          newFields.push({ phone_number: '' });
        } else {
          newFields.push({ email: '' });
        }
        return { ...prev, [field]: newFields };
      });
    }, []);

    const handleRemoveContact = useCallback(
      (index: number, field: 'phones_attributes' | 'emails_attributes') => {
        if (formData[field].length <= 1) return;

        setFormData(prev => {
          const newFields = [...prev[field]];
          newFields.splice(index, 1);
          return { ...prev, [field]: newFields };
        });
      },
      [formData],
    );

    const handleSelectedCustomer = useCallback(
      (admin: ProfileAdmin | null) => {
        if (errors.profile_admin) {
          const newErrors = { ...errors };
          delete newErrors.profile_admin;
          setErrors(newErrors);
        }
        setProfileAdmin(admin);
      },
      [errors],
    );

    const prepareFormData = useCallback((): FormData => {
      return {
        represent_attributes: {
          representor_id: Number(profileAdmin?.id),
        },
        phones_attributes: formData.phones_attributes,
        emails_attributes: formData.emails_attributes,
      };
    }, [formData, profileAdmin]);

    const handleSubmitForm = useCallback(() => {
      try {
        stepTwoSchema.parse({
          profile_admin: profileAdmin?.id || '',
          phone_numbers: formData.phones_attributes.map(p => p.phone_number),
          emails: formData.emails_attributes.map(e => e.email),
        });

        const data = prepareFormData();
        saveDataLocalStorage(data);

        if (editMode) {
          const updatedCustomer = { ...customerForm };
          if (updatedCustomer.data?.attributes) {
            updatedCustomer.data.attributes = {
              ...updatedCustomer.data.attributes,
              represent_attributes: {
                ...updatedCustomer.data.attributes.represent,
                representor_id: Number(profileAdmin?.id),
              },
              default_phone: formData.phones_attributes[0]?.phone_number,
              phones_attributes: formData.phones_attributes,
              emails_attributes: formData.emails_attributes,
            };
          }

          setCustomerForm(updatedCustomer);
          setNewCustomerForm({ ...newCustomerForm, ...data });
        } else {
          setCustomerForm({ ...customerForm, ...data });
        }

        nextStep();
      } catch (error) {
        handleFormError(error);
      }
    }, [
      formData,
      profileAdmin,
      editMode,
      customerForm,
      newCustomerForm,
      prepareFormData,
      saveDataLocalStorage,
      setCustomerForm,
      setNewCustomerForm,
      nextStep,
      handleFormError,
    ]);

    useImperativeHandle(ref, () => ({
      handleSubmitForm,
    }));

    const getErrorMessage = useCallback(
      (index: number, field: string) => {
        return errors[field]?.[index] || null;
      },
      [errors],
    );

    return (
      <>
        <Notification
          open={notification.open}
          message={notification.message}
          severity={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        />

        <RepresentativeModal
          pageTitle="Cadastro de Representante"
          isOpen={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
          handleRegistrationFinished={newId =>
            getCustomers(newId !== undefined ? String(newId) : undefined)
          }
        />

        <Container>
          {loading && (
            <LoadingOverlay>
              <CircularProgress size={30} style={{ color: '#01013D' }} />
            </LoadingOverlay>
          )}

          <div>
            <div className="flex gap-[16px]">
              <div>
                <Typography variant="h6" mb={1}>
                  Representante
                </Typography>

                <Select
                  options={customersList.map(customer => ({
                    label: `${customer.attributes.name} ${customer.attributes.last_name}`,
                    value: customer.id,
                  }))}
                  value={
                    profileAdmin
                      ? {
                          label: `${profileAdmin.attributes.name} ${profileAdmin.attributes.last_name}`,
                          value: profileAdmin.id,
                        }
                      : null
                  }
                  onChange={(option: { label: string; value: string } | null) =>
                    handleSelectedCustomer(customersList.find(c => c.id === option?.value) || null)
                  }
                  placeholder="Selecione um representante"
                  styles={{
                    control: (base: React.CSSProperties) => ({
                      ...base,
                      borderColor: errors.profile_admin ? 'red' : base.borderColor,
                      width: '394px',
                    }),
                  }}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'Nenhum representante encontrado'}
                />

                <Box sx={{ minHeight: '20px', mt: 0.5 }}>
                  {errors.profile_admin && (
                    <Typography variant="caption" color="error">
                      {errors.profile_admin}
                    </Typography>
                  )}
                </Box>
              </div>

              <div className="mt-[40px]">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsModalOpen(true)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: colors.quartiary,
                    color: colors.white,
                    width: 394,
                    '&:hover': { backgroundColor: colors.quartiaryHover },
                    height: 38,
                  }}
                >
                  <DescriptionText style={{ cursor: 'pointer' }}>
                    Adicionar Representante
                  </DescriptionText>
                  <MdOutlineAddCircle size={20} />
                </Button>
              </div>
            </div>

            <div className="flex gap-[16px]">
              <div>
                <Typography variant="h6" mb={1}>
                  Telefone
                </Typography>
                {formData.phones_attributes.map((phone, index) => (
                  <Box key={index} display="flex" flexDirection="column" mb={1} gap={0.75}>
                    <Box display="flex" gap={0.5}>
                      <CustomTextField
                        formData={formData as any}
                        customValue={phone.phone_number}
                        name="phone_number"
                        placeholder="Informe o Telefone"
                        handleInputChange={e =>
                          handleInputChange(index, e.target.value, 'phones_attributes')
                        }
                        errorMessage={getErrorMessage(index, 'phone_numbers')}
                        sx={{ width: '394px' }}
                      />
                      {formData.phones_attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(index, 'phones_attributes')}
                        >
                          <IoMdTrash size={20} color="#a50000" />
                        </button>
                      )}
                    </Box>
                    {index === formData.phones_attributes.length - 1 && (
                      <button
                        type="button"
                        className="flex items-center w-fit self-end"
                        onClick={() => handleAddInput('phones_attributes')}
                      >
                        <IoAddCircleOutline
                          className={`cursor-pointer ${formData.phones_attributes.length > 1 ? 'mr-6' : ''}`}
                          color={colors.quartiary}
                          size={20}
                        />
                      </button>
                    )}
                  </Box>
                ))}
              </div>

              <div>
                <Typography variant="h6" mb={1}>
                  E-mail
                </Typography>
                {formData.emails_attributes.map((email, index) => (
                  <Box key={index} display="flex" flexDirection="column" mb={1} gap={0.75}>
                    <Box display="flex" gap={0.5}>
                      <CustomTextField
                        formData={formData as any}
                        customValue={email.email}
                        name="email"
                        placeholder="Informe o Email"
                        handleInputChange={e =>
                          handleInputChange(index, e.target.value, 'emails_attributes')
                        }
                        errorMessage={getErrorMessage(index, 'emails')}
                        sx={{ width: '394px' }}
                      />
                      {formData.emails_attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(index, 'emails_attributes')}
                        >
                          <IoMdTrash size={20} color="#a50000" />
                        </button>
                      )}
                    </Box>
                    {index === formData.emails_attributes.length - 1 && (
                      <button
                        type="button"
                        className="flex items-center w-fit self-end"
                        onClick={() => handleAddInput('emails_attributes')}
                      >
                        <IoAddCircleOutline
                          className={`cursor-pointer ${formData.emails_attributes.length > 1 ? 'mr-6' : ''}`}
                          color={colors.quartiary}
                          size={20}
                        />
                      </button>
                    )}
                  </Box>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </>
    );
  },
);

PJCustomerStepTwo.displayName = 'PJCustomerStepTwo';
export default PJCustomerStepTwo;
