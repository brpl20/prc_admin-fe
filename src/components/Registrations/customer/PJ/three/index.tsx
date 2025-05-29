import { animateScroll as scroll } from 'react-scroll';
import {
  useState,
  useEffect,
  useContext,
  forwardRef,
  useImperativeHandle,
  ChangeEvent,
  useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import { Container } from '../styles';
import { Notification } from '@/components';
import { LoadingOverlay } from '@/components/Registrations/work/one/styles';
import { CustomerContext } from '@/contexts/CustomerContext';
import { getAllBanks } from '@/services/brasilAPI';
import { z } from 'zod';
import BankAutocomplete from './BankAutocomplete';
import BankFormInputs from './BankFormInputs';

const stepThreeSchema = z.object({
  bank: z.string(),
  agency: z.string(),
  operation: z.string(),
  account: z.string(),
  pix: z.string(),
});

const PJCustomerStepThree = forwardRef(({ nextStep, editMode }: any, ref) => {
  const [loading, setLoading] = useState(true);
  const [bankList, setBankList] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [formData, setFormData] = useState({
    bank: '',
    agency: '',
    op: '',
    account: '',
    pix: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

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

  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext(CustomerContext);

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = ['agency', 'account', 'op'].includes(name) ? value.replace(/\D/g, '') : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleBankChange = (event: any, value: any) => {
    if (value) {
      setFormData(prev => ({ ...prev, bank: value.name }));
      setSelectedBank(value);
      setErrors((prev: any) => ({ ...prev, bank: '' }));
    } else {
      setFormData(prev => ({ ...prev, bank: '' }));
      setSelectedBank(null);
      setErrors((prev: any) => ({ ...prev, bank: 'Banco é obrigatório.' }));
    }
  };

  const showError = (err: any) => {
    const fieldErrors = err?.formErrors?.fieldErrors ?? {};
    const errorMap: any = {};
    for (const key in fieldErrors) {
      errorMap[key] = fieldErrors[key][0];
    }
    setErrors(errorMap);
    setNotification({
      open: true,
      message: 'Preencha todos os campos obrigatórios.',
      type: 'error',
    });
  };

  const persistLocalStorage = (data: any) => {
    localStorage.setItem('PJ/Three', JSON.stringify(data));
  };

  const handleSubmitForm = () => {
    try {
      stepThreeSchema.parse({
        bank: formData.bank,
        agency: formData.agency,
        operation: formData.op,
        account: formData.account,
        pix: formData.pix,
      });

      const bankData = {
        bank_name: formData.bank,
        agency: formData.agency,
        operation: formData.op,
        account: formData.account,
        pix: formData.pix,
      };

      const updatedData = { ...customerForm, bank_accounts_attributes: [bankData] };
      persistLocalStorage(updatedData);

      if (editMode) {
        const existing = customerForm.data.attributes.bank_accounts;
        if (existing[0]) {
          Object.assign(existing[0], bankData);
        } else {
          customerForm.data.attributes.bank_accounts_attributes = [bankData];
        }
        setCustomerForm(customerForm);
        setNewCustomerForm({ ...newCustomerForm, bank_accounts_attributes: [bankData] });
      } else {
        setCustomerForm(updatedData);
      }

      setNotification({
        open: true,
        message: 'Dados bancários salvos com sucesso.',
        type: 'success',
      });

      nextStep();
    } catch (err) {
      if (err instanceof z.ZodError) {
        handleFormError(err);
      } else {
        console.error('Erro ao submeter o formulário:', err);
        showError(err);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [banks] = await Promise.all([getAllBanks(true)]);
        setBankList(banks);

        const formFromContext = customerForm?.data?.attributes?.bank_accounts?.[0];
        const formFromStorage = JSON.parse(localStorage.getItem('PJ/Three') || 'null');

        let account = null;

        if (formFromContext) {
          account = formFromContext;
        } else if (formFromStorage?.bank_accounts_attributes?.[0]) {
          account = formFromStorage.bank_accounts_attributes[0];
        }

        if (account) {
          setFormData({
            bank: account.bank_name || '',
            agency: account.agency || '',
            op: account.operation || '',
            account: account.account || '',
            pix: account.pix || '',
          });
        }
      } catch (err) {
        showNotification('Erro ao carregar os dados bancários.', 'error');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    getAllBanks(true).then(setBankList).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.bank && bankList.length > 0) {
      const found = bankList.find(b => b.name === formData.bank);
      setSelectedBank(found);
    }
  }, [formData.bank, bankList]);

  return (
    <>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />

      <Container loading={loading}>
        {loading && (
          <LoadingOverlay>
            <CircularProgress size={30} style={{ color: '#01013D' }} />
          </LoadingOverlay>
        )}

        <div className="max-w-[600px] flex flex-col gap-[16px]">
          <BankAutocomplete
            bankList={bankList}
            selectedBank={selectedBank}
            onChange={handleBankChange}
            error={!!errors.bank}
          />

          <BankFormInputs formData={formData} onChange={handleInputChange} errors={errors} />
        </div>
      </Container>
    </>
  );
});

export default PJCustomerStepThree;
