import React, {
  useState,
  useEffect,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  ChangeEvent,
} from 'react';

import { Container } from '../styles';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import { getAllBanks } from '@/services/brasilAPI';
import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import { Notification } from '@/components';
import { z } from 'zod';

export interface IRefPJCustomerStepThreeProps {
  handleSubmitForm: () => void;
}

interface IStepThreeProps {
  nextStep: () => void;
  editMode: boolean;
}

interface FormData {
  bank: string;
  agency: string;
  op: string;
  account: string;
  pix: string;
}

const stepThreeSchema = z.object({
  bank: z.string(),
  agency: z.string(),
  operation: z.string(),
  account: z.string(),
  pix: z.string(),
});

const PJCustomerStepThree: ForwardRefRenderFunction<
  IRefPJCustomerStepThreeProps,
  IStepThreeProps
> = ({ nextStep, editMode }, ref) => {
  const [errors, setErrors] = useState({} as any);
  const [bankList, setBankList] = useState([] as any[]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext(CustomerContext);
  const [formData, setFormData] = useState<FormData>({
    bank: '',
    agency: '',
    op: '',
    account: '',
    pix: '',
  });

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

  const handleBankChange = (event: any, value: any) => {
    if (value) {
      setFormData(prevData => ({
        ...prevData,
        bank: value.name,
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        bank: '',
      }));
    }
  };

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PJ/Three');

    if (data) {
      const parsedData = JSON.parse(data);
      setFormData(prevData => ({
        ...prevData,
        bank: parsedData.bank_accounts_attributes[0].bank_name,
        agency: parsedData.bank_accounts_attributes[0].agency,
        op: parsedData.bank_accounts_attributes[0].operation,
        account: parsedData.bank_accounts_attributes[0].account,
        pix: parsedData.bank_accounts_attributes[0].pix,
      }));
    }
  };

  useEffect(() => {
    verifyDataLocalStorage();
  }, []);

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('PJ/Three', JSON.stringify(data));
  };

  const handleSubmitForm = () => {
    saveDataLocalStorage({
      ...customerForm,
      bank_accounts_attributes: [
        {
          bank_name: formData.bank,
          agency: formData.agency,
          operation: formData.op,
          account: formData.account,
          pix: formData.pix,
        },
      ],
    });

    try {
      stepThreeSchema.parse({
        bank: formData.bank,
        agency: formData.agency,
        operation: formData.op,
        account: formData.account,
        pix: formData.pix,
      });

      if (editMode) {
        const bankAccount = customerForm.data.attributes.bank_accounts;

        if (bankAccount[0]) {
          bankAccount[0].bank_name = formData.bank;
          bankAccount[0].agency = formData.agency;
          bankAccount[0].operation = formData.op;
          bankAccount[0].account = formData.account;
          bankAccount[0].pix = formData.pix;
        } else {
          customerForm.data.attributes.bank_accounts_attributes = [
            {
              bank_name: formData.bank,
              agency: formData.agency,
              operation: formData.op,
              account: formData.account,
              pix: formData.pix,
            },
          ];
        }

        setCustomerForm(customerForm);

        setNewCustomerForm({
          ...newCustomerForm,
          bank_accounts_attributes: [
            {
              bank_name: formData.bank,
              agency: formData.agency,
              operation: formData.op,
              account: formData.account,
              pix: formData.pix,
            },
          ],
        });

        nextStep();
        return;
      }

      const data = {
        ...customerForm,
        bank_accounts_attributes: [
          {
            bank_name: formData.bank,
            agency: formData.agency,
            operation: formData.op,
            account: formData.account,
            pix: formData.pix,
          },
        ],
      };

      setCustomerForm(data);
      nextStep();
    } catch (err) {
      handleFormError(err);
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

  const renderInputField = (
    label: string,
    name: keyof FormData,
    placeholderValue: string,
    widthValue: string,
    error?: boolean,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${widthValue}` }}>
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {label}
      </Typography>
      <TextField
        id="outlined-basic"
        variant="outlined"
        fullWidth
        name={name}
        size="small"
        sx={{ flex: 1 }}
        value={formData[name]}
        autoComplete="off"
        placeholder={`${placeholderValue}`}
        onChange={handleInputChange}
        error={error && !formData[name]}
      />
    </div>
  );

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    const getBanks = async () => {
      try {
        const response = await getAllBanks(true);
        setBankList(response);
      } catch (error: any) {
        console.error(error);
      }
    };

    getBanks();
  }, []);

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = customerForm.data.attributes.bank_accounts[0];

      if (attributes) {
        setFormData(prevData => ({
          ...prevData,
          bank: attributes.bank_name,
          agency: attributes.agency,
          op: attributes.operation,
          account: attributes.account,
          pix: attributes.pix,
        }));
      }
    };

    if (customerForm.data) {
      handleDataForm();
    }
  }, [customerForm]);

  useEffect(() => {
    if (formData.bank !== '' && bankList.length > 0) {
      const bank = bankList.find(bank => bank.name === formData.bank);
      setSelectedBank(bank);
    }
  }, [formData.bank, bankList]);

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

      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '600px',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            {'Banco'}
          </Typography>

          <Autocomplete
            limitTags={1}
            id="multiple-limit-tags"
            value={selectedBank}
            options={bankList}
            getOptionLabel={option => option?.name ?? ''}
            onChange={handleBankChange}
            renderInput={params => (
              <TextField
                placeholder="Selecione um Banco"
                {...params}
                size="small"
                error={!!errors.bank}
              />
            )}
            sx={{ backgroundColor: 'white', zIndex: 1 }}
            noOptionsText="Nenhum Banco Encontrado"
          />
        </Box>

        <div style={{ display: 'flex', gap: '16px' }}>
          {renderInputField('Agência', 'agency', 'Número da agencia', '100%', !!errors.agency)}
          {renderInputField('Operação', 'op', 'Op.', '100px', !!errors.operation)}
          {renderInputField('Conta', 'account', 'Número da conta', '100%', !!errors.account)}
        </div>

        <Box>
          {renderInputField('Cadastrar Chave Pix', 'pix', 'Informe a chave', '100%', !!errors.pix)}
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(PJCustomerStepThree);
