import React, {
  useContext,
  useEffect,
  useState,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';
import { Flex } from '@/styles/globals';
import { Container, Input } from './styles';

import { Box, Typography, TextField, Autocomplete } from '@mui/material';
import { MdOutlineInfo } from 'react-icons/md';

import { ICustomerProps } from '@/interfaces/ICustomer';
import { getAllProfileCustomer } from '@/services/customers';

import CustomTooltip from '@/components/Tooltip';
import { WorkContext } from '@/contexts/WorkContext';
import { moneyMask, percentMask } from '@/utils/masks';
import { Notification } from '@/components';
import { useRouter } from 'next/router';

export interface IRefWorkStepFiveProps {
  handleSubmitForm: () => void;
}

interface IStepFiveProps {
  nextStep: () => void;
}

const WorkStepFive: ForwardRefRenderFunction<IRefWorkStepFiveProps, IStepFiveProps> = (
  { nextStep },
  ref,
) => {
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const { workForm, setWorkForm } = useContext(WorkContext);
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);

  const [costumerId, setCostumerId] = useState<string>();
  const [percentage, setPercentage] = useState<string>();
  const [commission, setCommission] = useState<string>();
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerProps>();

  const route = useRouter();

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  const handlePercentage = (value: string) => {
    if (value) {
      const input = document.getElementById('percentage') as HTMLInputElement;
      input.value = `${value}%`;
      setPercentage(value);
    } else {
      setPercentage('');
    }
  };

  useEffect(() => {
    const getCustomers = async () => {
      const response = await getAllProfileCustomer('');
      setCustomersList(response.data);
    };

    getCustomers();
  }, []);

  const handleSelectedCustomer = (customer: ICustomerProps) => {
    if (customer) {
      setCostumerId(customer.id);
      setSelectedCustomer(customer);
    } else {
      setCostumerId(undefined);
      setSelectedCustomer(undefined);
    }
  };

  const handleSubmitForm = () => {
    try {
      let data = {
        ...workForm,
      };

      if (route.asPath.includes('alterar') && selectedCustomer) {
        data.recommendations_attributes = [
          {
            id: workForm.data.attributes.recommendations?.[0]?.id,
            profile_customer_id: selectedCustomer.id,
            percentage: `${percentage}`,
            commission: commission
              ? Number(commission.replace('R$', '').replace('.', '').replace(',', '.'))
              : 0,
          },
        ];
      } else if (selectedCustomer) {
        data.recommendations_attributes = [
          {
            profile_customer_id: selectedCustomer.id,
            percentage: `${percentage}`,
            commission: commission
              ? Number(commission.replace('R$', '').replace('.', '').replace(',', '.'))
              : '',
          },
        ];
      }

      setWorkForm(data);
      saveDataLocalStorage(data);
      nextStep();
    } catch (err) {
      handleFormError(err);
    }
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
  };

  useEffect(() => {
    const handleDraftWork = () => {
      const draftWork = workForm.draftWork;

      if (draftWork.id) {
        if (draftWork.attributes) {
          const attributes = draftWork.attributes;

          if (attributes.recommendations) {
            if (attributes.recommendations[0]?.percentage) {
              handlePercentage(attributes.recommendations[0].percentage);
            }

            if (attributes.recommendations[0]?.commission) {
              setCommission(
                `R$ ${parseFloat(attributes.recommendations[0].commission)
                  .toFixed(2)
                  .replace('.', ',')
                  .replace(/\d(?=(\d{3})+,)/g, '$&.')}`,
              );
            }

            if (attributes.recommendations[0]?.profile_customer_id) {
              if (customersList.length === 0) {
                return;
              }

              const customer = customersList.find(
                customer => customer.id == attributes.recommendations[0].profile_customer_id,
              );

              setCostumerId(customer?.id);
              setSelectedCustomer(customer);
            }
          }
        }
      }
    };

    const handleDataForm = () => {
      const attributes = workForm.data.attributes;

      if (attributes) {
        if (attributes.recommendations) {
          handlePercentage(attributes.recommendations_attributes?.[0]?.percentage ?? '');

          setCommission(
            `R$ ${parseFloat(attributes.recommendations?.[0]?.commission ?? 0)
              .toFixed(2)
              .replace('.', ',')
              .replace(/\d(?=(\d{3})+,)/g, '$&.')}`,
          );

          const customer = customersList.find(
            customer => customer.id == attributes.recommendations?.[0]?.profile_customer_id,
          );

          setCostumerId(customer?.id);
          setSelectedCustomer(customer);
        }
      }
    };

    if (workForm.data) {
      handleDataForm();
    }

    if (workForm.draftWork && workForm.draftWork.id) {
      handleDraftWork();
    }
  }, [workForm, customersList]);

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/Five', JSON.stringify(data));
  };

  useEffect(() => {
    const verifyDataLocalStorage = async () => {
      const data = localStorage.getItem('WORK/Five');

      if (data) {
        const parsedData = JSON.parse(data);

        handlePercentage(parsedData.recommendations_attributes?.[0].percentage ?? '');

        if (parsedData.recommendations_attributes[0].commission) {
          setCommission(
            `R$ ${parseFloat(parsedData.recommendations_attributes[0].commission)
              .toFixed(2)
              .replace('.', ',')
              .replace(/\d(?=(\d{3})+,)/g, '$&.')}`,
          );
        }

        if (parsedData.recommendations_attributes[0].profile_customer_id) {
          if (customersList.length === 0) {
            return;
          }

          const customer = customersList.find(
            customer => customer.id == parsedData.recommendations_attributes[0].profile_customer_id,
          );

          setSelectedCustomer(customer);
        }
      }
    };

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

      <Container>
        <Box mr={'16px'}>
          <Flex className="inputContainer">
            <Flex
              style={{
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant="h6"
                style={{ height: '32px' }}
              >
                {'Indicação'}
              </Typography>
              <CustomTooltip
                title="Quando há alguma pessoa de referência pela indicação do cliente, com possibilidade de adicionar comissionamento ou não. Ele terá acesso ao trabalho com um usuário limitado."
                placement="right"
              >
                <span
                  style={{
                    display: 'flex',
                  }}
                >
                  <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
                </span>
              </CustomTooltip>
            </Flex>
            <Autocomplete
              limitTags={1}
              options={customersList}
              getOptionLabel={option => option.attributes.name}
              renderInput={params => (
                <TextField placeholder="Selecione um Cliente" {...params} size="small" />
              )}
              sx={{ backgroundColor: 'white', zIndex: 1 }}
              noOptionsText="Nenhum Cliente Encontrado"
              onChange={(event, value) => handleSelectedCustomer(value as ICustomerProps)}
              value={selectedCustomer || null}
            />
          </Flex>

          <Flex className="inputContainer">
            <Typography variant="h6" sx={{ marginBottom: '8px' }}>
              {'Comissão'}
            </Typography>
            <Flex style={{ gap: '16px', marginLeft: '2px' }}>
              <Flex style={{ gap: '8px', flexDirection: 'column' }}>
                <Typography variant="h6" style={{ fontSize: '16px' }}>
                  {'Valor'}
                </Typography>
                <Input>
                  <TextField
                    size="small"
                    autoComplete="off"
                    placeholder="R$"
                    variant="outlined"
                    InputProps={{
                      id: 'commission',
                    }}
                    onChange={(e: any) => {
                      const inputValue = e.target.value;

                      setCommission(`R$ ${moneyMask(inputValue)}`);
                    }}
                    value={commission}
                  />
                </Input>
              </Flex>

              <Flex style={{ gap: '8px', flexDirection: 'column' }}>
                <Typography variant="h6" style={{ fontSize: '16px' }}>
                  {'Porcentagem'}
                </Typography>
                <Input>
                  <TextField
                    id="outlined-basic"
                    variant="outlined"
                    autoComplete="off"
                    size="small"
                    inputProps={{
                      id: 'percentage',
                    }}
                    value={percentage}
                    onChange={(e: any) => {
                      const value = e.target.value ? e.target.value : '';
                      setPercentage(value ? percentMask(value) : '');
                    }}
                  />
                </Input>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(WorkStepFive);
