import React, {
  useState,
  useEffect,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  ChangeEvent,
} from 'react';

import { Flex } from '@/styles/globals';
import { Container } from '../styles';
import { CustomerContext } from '@/contexts/CustomerContext';

import { getAllBanks } from '@/services/brasilAPI';
import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import { Notification } from '@/components';

export interface IRefPFCustomerStepFourProps {
  handleSubmitForm: () => void;
}

interface IStepFourProps {
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

const PFCustomerStepFour: ForwardRefRenderFunction<IRefPFCustomerStepFourProps, IStepFourProps> = (
  { nextStep, editMode },
  ref,
) => {
  const [bankList, setBankList] = useState([] as any[]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const [formData, setFormData] = useState<FormData>({
    bank: '',
    agency: '',
    op: '',
    account: '',
    pix: '',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const verifyDataLocalStorage = () => {
    const data = localStorage.getItem('PF/Four');

    if (data) {
      const parsedData = JSON.parse(data);
      setFormData({
        bank: parsedData.bank_accounts_attributes[0].bank_name,
        agency: parsedData.bank_accounts_attributes[0].agency,
        op: parsedData.bank_accounts_attributes[0].operation,
        account: parsedData.bank_accounts_attributes[0].account,
        pix: parsedData.bank_accounts_attributes[0].pix,
      });
    }
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('PF/Four', JSON.stringify(data));
  };

  const handleBankChange = (event: any, value: any) => {
    if (value) {
      setFormData(prevData => ({
        ...prevData,
        bank: value.name,
      }));
    } else {
      setSelectedBank(null);
      setFormData(prevData => ({
        ...prevData,
        bank: '',
      }));
    }
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
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
      if (!formData.bank) {
        throw new Error('Banco é obrigatório');
      }

      if (!selectedBank) {
        throw new Error('Banco é obrigatório');
      }

      if (!formData.agency) {
        throw new Error('Agência é obrigatório');
      }

      if (!formData.op) {
        throw new Error('Operação é obrigatório');
      }

      if (!formData.account) {
        throw new Error('Conta é obrigatório');
      }

      if (!formData.pix) {
        throw new Error('Chave Pix é obrigatório');
      }

      if (editMode) {
        customerForm.data.attributes.bank_accounts_attributes = [
          {
            id:
              customerForm.data.attributes.bank_accounts[0] &&
              customerForm.data.attributes.bank_accounts[0].id
                ? customerForm.data.attributes.bank_accounts[0].id
                : '',
            bank_name: formData.bank,
            agency: formData.agency,
            operation: formData.op,
            account: formData.account,
            pix: formData.pix,
          },
        ];

        setCustomerForm(customerForm);
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

  const renderInputField = (
    label: string,
    name: keyof FormData,
    placeholderValue: string,
    widthValue: string,
  ) => (
    <Flex style={{ flexDirection: 'column', width: `${widthValue}` }}>
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
        value={formData[name] ? formData[name] : ''}
        autoComplete="off"
        placeholder={`${placeholderValue}`}
        onChange={handleInputChange}
      />
    </Flex>
  );

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    const getBanks = async () => {
      try {
        const response = await getAllBanks();
        const uniqueBanks = removeDuplicateBanks(response);
        setBankList(uniqueBanks);
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

        setSelectedBank(attributes.bank_name);
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

      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '524px',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            {'Banco'}
          </Typography>

          <Autocomplete
            limitTags={1}
            id="multiple-limit-tags"
            value={selectedBank ? selectedBank : ''}
            options={bankList}
            getOptionLabel={option => (option.name ? option.name : '')}
            onChange={handleBankChange}
            renderInput={params => (
              <TextField placeholder="Selecione um Banco" {...params} size="small" />
            )}
            sx={{ backgroundColor: 'white', zIndex: 1 }}
            noOptionsText="Nenhum Banco Encontrado"
          />
        </Box>

        <Flex style={{ gap: '16px' }}>
          {renderInputField('Agência', 'agency', 'Número da agencia', '100%')}
          {renderInputField('Operação', 'op', 'Op.', '100px')}
          {renderInputField('Conta', 'account', 'Número da conta', '100%')}
        </Flex>

        <Box>{renderInputField('Cadastrar Chave Pix', 'pix', 'Informe a chave', '100%')}</Box>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepFour);
