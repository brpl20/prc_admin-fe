import React, {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
} from 'react';

import { colors, Flex } from '@/styles/globals';
import Notification from '@/components/Notification';
import { Container, Input, OptionsArea } from './styles';

import { animateScroll as scroll } from 'react-scroll';

import CustomTooltip from '@/components/Tooltip';
import { MdOutlineInfo } from 'react-icons/md';
import { WorkContext } from '@/contexts/WorkContext';

import {
  Box,
  FormControl,
  FormControlLabel,
  Typography,
  Radio,
  Select,
  MenuItem,
} from '@mui/material';
import { moneyMask, percentMask } from '@/utils/masks';
import { useRouter } from 'next/router';
import { z } from 'zod';

const instalmentOptions = [
  '1x',
  '2x',
  '3x',
  '4x',
  '5x',
  '6x',
  '7x',
  '8x',
  '9x',
  '10x',
  '11x',
  '12x',
];

export interface IRefWorkStepTwoProps {
  handleSubmitForm: () => void;
}

interface IStepTwoProps {
  nextStep: () => void;
}

const stepTwoSchema = z.object({
  honoraryType: z.string().nonempty(),
});

const WorkStepTwo: ForwardRefRenderFunction<IRefWorkStepTwoProps, IStepTwoProps> = (
  { nextStep },
  ref,
) => {
  const [isVisibleOptionsArea, setIsVisibleOptionsArea] = useState(false);
  const { workForm, setWorkForm } = useContext(WorkContext);
  const [errors, setErrors] = useState({} as any);

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [honoraryType, setHonoraryType] = useState('');
  const [valueOfFixed, setValueOfFixed] = useState<string>();
  const [valueOfPercent, setValueOfPercent] = useState<string>();

  const [parcelling, setParcelling] = useState(false);
  const [numberOfInstallments, setNumberOfInstallments] = useState('');

  const route = useRouter();

  const handleCategorySelection = (value: string) => {
    const newValue = honoraryType != value ? value : '';
    setHonoraryType(newValue);

    if (newValue === 'work') {
      setValueOfPercent('');
      setIsVisibleOptionsArea(true);
    }

    if (newValue === 'success') {
      setValueOfFixed('');
      setParcelling(false);
      setNumberOfInstallments('');
      setIsVisibleOptionsArea(true);
    }

    value.search('bonus') < 0 ? setIsVisibleOptionsArea(true) : setIsVisibleOptionsArea(false);
  };

  const handleSubmitForm = () => {
    try {
      stepTwoSchema.parse({
        honoraryType: honoraryType,
      });

      if (honoraryType === 'success' && valueOfPercent === '') {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      if (honoraryType === 'work' && valueOfFixed === '') {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      if (
        (honoraryType === 'both' && valueOfFixed === '') ||
        (honoraryType === 'both' && valueOfPercent === '')
      ) {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      if (parcelling && numberOfInstallments === '') {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      let honorary_attributes = {} as any;

      if (route.asPath.includes('alterar')) {
        honorary_attributes = {
          id:
            workForm.data.attributes.honorary && workForm.data.attributes.honorary.id
              ? workForm.data.attributes.honorary.id
              : '',
          fixed_honorary_value: valueOfFixed?.replace('R$ ', '').replace('.', '').replace(',', '.'),
          percent_honorary_value: valueOfPercent?.toString(),
          parcelling: parcelling,
          parcelling_value: numberOfInstallments.replace('x', ''),
          honorary_type: honoraryType,
        };
      }

      if (!route.asPath.includes('alterar')) {
        honorary_attributes = {
          fixed_honorary_value: valueOfFixed?.replace('R$ ', '').replace('.', '').replace(',', '.'),
          percent_honorary_value: valueOfPercent?.toString(),
          parcelling: parcelling,
          parcelling_value: numberOfInstallments.replace('x', ''),
          honorary_type: honoraryType,
        };
      }

      const data = {
        ...workForm,
        honorary_attributes: honorary_attributes,
      } as any;

      setWorkForm(data);
      saveDataLocalStorage(data);
      nextStep();
    } catch (error: any) {
      handleFormError(error);
    }

    scroll.scrollToTop({
      duration: 500,
      smooth: 'easeInOutQuart',
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

  const verifyDataLocalStorage = async () => {
    const data = localStorage.getItem('WORK/Two');

    if (data) {
      const parsedData = JSON.parse(data);

      setHonoraryType(parsedData.honorary_attributes.honorary_type);
      setValueOfFixed(parsedData.honorary_attributes.fixed_honorary_value);
      setValueOfPercent(parsedData.honorary_attributes.percent_honorary_value);
      setParcelling(parsedData.honorary_attributes.parcelling);
      setNumberOfInstallments(
        parsedData.honorary_attributes.parcelling_value
          ? `${parsedData.honorary_attributes.parcelling_value}x`
          : '',
      );

      if (parsedData.honorary_attributes.parcelling) {
        setParcelling(true);
      }

      if (parsedData.honorary_attributes.honorary_type.search('work') >= 0) {
        setIsVisibleOptionsArea(true);
      }

      if (parsedData.honorary_attributes.honorary_type.search('success') >= 0) {
        setIsVisibleOptionsArea(true);
      }

      if (parsedData.honorary_attributes.honorary_type.search('both') >= 0) {
        setIsVisibleOptionsArea(true);
      }

      if (parsedData.honorary_attributes.honorary_type.search('bonus') >= 0) {
        setIsVisibleOptionsArea(false);
      }

      if (parsedData.honorary_attributes.fixed_honorary_value) {
        setValueOfFixed(
          `R$ ${parseFloat(parsedData.honorary_attributes.fixed_honorary_value)
            .toFixed(2)
            .replace('.', ',')
            .replace(/\d(?=(\d{3})+,)/g, '$&.')}`,
        );
      }
    }
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/Two', JSON.stringify(data));
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    const handleDraftWork = () => {
      const draftWork = workForm.draftWork;

      if (draftWork.id) {
        if (draftWork.attributes) {
          const attributes = draftWork.attributes;

          if (attributes.honorary) {
            if (attributes.honorary.honorary_type) {
              setHonoraryType(attributes.honorary.honorary_type);
            }

            if (attributes.honorary.fixed_honorary_value) {
              setValueOfFixed(
                `R$ ${parseFloat(attributes.honorary.fixed_honorary_value)
                  .toFixed(2)
                  .replace('.', ',')
                  .replace(/\d(?=(\d{3})+,)/g, '$&.')}`,
              );
            }

            if (attributes.honorary.percent_honorary_value) {
              setValueOfPercent(attributes.honorary.percent_honorary_value);
            }

            if (attributes.honorary.parcelling) {
              setParcelling(attributes.honorary.parcelling);
            }

            if (attributes.honorary.parcelling_value) {
              setNumberOfInstallments(`${attributes.honorary.parcelling_value}x`);
            }

            if (attributes.honorary.parcelling) {
              setParcelling(true);
            }

            if (attributes.honorary.honorary_type.search('work') >= 0) {
              setIsVisibleOptionsArea(true);
            }

            if (attributes.honorary.honorary_type.search('success') >= 0) {
              setIsVisibleOptionsArea(true);
            }

            if (attributes.honorary.honorary_type.search('both') >= 0) {
              setIsVisibleOptionsArea(true);
            }

            if (attributes.honorary.honorary_type.search('bonus') >= 0) {
              setIsVisibleOptionsArea(false);
            }
          }
        }
      }
    };

    const handleDataForm = () => {
      const attributes = workForm.data.attributes;

      if (attributes.honorary) {
        setHonoraryType(attributes.honorary.honorary_type);
        setValueOfFixed(
          `R$ ${parseFloat(attributes.honorary.fixed_honorary_value)
            .toFixed(2)
            .replace('.', ',')
            .replace(/\d(?=(\d{3})+,)/g, '$&.')}`,
        );
        setValueOfPercent(attributes.honorary.percent_honorary_value);
        setParcelling(attributes.honorary.parcelling);
        setNumberOfInstallments(
          attributes.honorary.parcelling_value ? `${attributes.honorary.parcelling_value}x` : '',
        );

        if (attributes.honorary.parcelling) {
          setParcelling(true);
        }

        if (attributes.honorary.honorary_type.search('work') >= 0) {
          setIsVisibleOptionsArea(true);
        }

        if (attributes.honorary.honorary_type.search('success') >= 0) {
          setIsVisibleOptionsArea(true);
        }

        if (attributes.honorary.honorary_type.search('both') >= 0) {
          setIsVisibleOptionsArea(true);
        }

        if (attributes.honorary.honorary_type.search('bonus') >= 0) {
          setIsVisibleOptionsArea(false);
        }
      }
    };

    if (workForm.data) {
      handleDataForm();
    }

    if (workForm.draftWork && workForm.draftWork.id) {
      handleDraftWork();
    }
  }, [workForm]);

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
        <Flex
          style={{
            flexDirection: 'row',
            marginTop: '16px',
            minHeight: '348px',
          }}
        >
          <Flex style={{ flexDirection: 'column', width: '400px' }}>
            <Flex>
              <Typography
                variant="h6"
                sx={{ marginBottom: '8px', fontSize: '1.1rem' }}
                style={{
                  color: honoraryType === '' ? '#FF0000' : 'black',
                }}
              >
                {'Honorários de Trabalho ou Êxito'}
              </Typography>
              {errors.honoraryType && honoraryType === '' && (
                <label className="flagError">{'*'}</label>
              )}
            </Flex>

            <Box>
              <Flex
                style={{
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  sx={{ width: '140px' }}
                  control={
                    <Radio
                      size="small"
                      value="work"
                      checked={honoraryType === 'work'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleCategorySelection(e.target.value)
                      }
                    />
                  }
                  label="Trabalho"
                />
                <CustomTooltip
                  title="Geralmente para procedimentos por valor fixo e diligências."
                  placement="right"
                >
                  <span
                    style={{
                      display: 'flex',
                    }}
                  >
                    <MdOutlineInfo style={{ marginLeft: '-8px' }} size={20} />
                  </span>
                </CustomTooltip>
              </Flex>
            </Box>

            <Box>
              <Flex
                style={{
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  sx={{ width: '140px' }}
                  control={
                    <Radio
                      size="small"
                      value="success"
                      checked={honoraryType === 'success'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleCategorySelection(e.target.value)
                      }
                    />
                  }
                  label="Êxito"
                />
                <CustomTooltip
                  title="Contrato de risco pago de acordo com os benefícios recebidos pelo cliente em %."
                  placement="right"
                >
                  <span
                    style={{
                      display: 'flex',
                    }}
                  >
                    <MdOutlineInfo style={{ marginLeft: '-8px' }} size={20} />
                  </span>
                </CustomTooltip>
              </Flex>
            </Box>

            <Box>
              <Flex
                style={{
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  sx={{ width: '140px' }}
                  control={
                    <Radio
                      size="small"
                      value="both"
                      checked={honoraryType === 'both'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleCategorySelection(e.target.value)
                      }
                    />
                  }
                  label="Ambos"
                />
                <CustomTooltip
                  title="Combinação entre honorários fixos e percentuais."
                  placement="right"
                >
                  <span
                    style={{
                      display: 'flex',
                    }}
                  >
                    <MdOutlineInfo style={{ marginLeft: '-8px' }} size={20} />
                  </span>
                </CustomTooltip>
              </Flex>
            </Box>

            <Box>
              <Flex
                style={{
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  sx={{ width: '140px' }}
                  control={
                    <Radio
                      size="small"
                      value="bonus"
                      checked={honoraryType === 'bonus'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleCategorySelection(e.target.value)
                      }
                    />
                  }
                  label="Pro-bono"
                />
                <CustomTooltip
                  title="Atuação Pro Bono, ou seja, sem cobrança de honorários."
                  placement="right"
                >
                  <span
                    style={{
                      display: 'flex',
                    }}
                  >
                    <MdOutlineInfo style={{ marginLeft: '-8px' }} size={20} />
                  </span>
                </CustomTooltip>
              </Flex>
            </Box>
            {honoraryType.search('work') >= 0 || honoraryType.search('both') >= 0 ? (
              <Box sx={{ marginTop: '16px' }}>
                <Flex
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    display={'flex'}
                    alignItems={'center'}
                    variant="h6"
                    style={{ height: '40px' }}
                  >
                    {'Parcelamento'}
                  </Typography>
                  <CustomTooltip
                    title="No caso dos honorários fixos, especifique se você trabalhou com parcelamento dos valores."
                    placement="right"
                  >
                    <span
                      style={{
                        display: 'flex',
                      }}
                    >
                      <MdOutlineInfo style={{ marginLeft: '11px' }} size={20} />
                    </span>
                  </CustomTooltip>
                </Flex>
                <Box>
                  <FormControlLabel
                    control={
                      <Radio
                        size="small"
                        value={true}
                        checked={parcelling}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setParcelling(e.target.value === 'true')
                        }
                      />
                    }
                    label="Sim"
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Radio
                        size="small"
                        value={false}
                        checked={!parcelling}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setParcelling(e.target.value === 'true')
                        }
                      />
                    }
                    label="Não"
                  />
                </Box>
              </Box>
            ) : null}
          </Flex>
          {isVisibleOptionsArea ? (
            <OptionsArea>
              {honoraryType == 'work' && (
                <FormControl>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ marginBottom: '8px' }}
                      style={{
                        color: valueOfFixed === '' ? '#FF0000' : 'black',
                      }}
                    >
                      {'Valor de Honorários Fixos'}
                    </Typography>
                    <Flex style={{ flexDirection: 'column' }}>
                      <FormControl sx={{ width: '314px' }}>
                        <Input
                          id="honoraryValue"
                          placeholder="R$"
                          value={valueOfFixed}
                          onChange={(e: any) => {
                            const inputValue = e.target.value;

                            setValueOfFixed(`R$ ${moneyMask(inputValue)}`);
                          }}
                          min="0"
                        />
                      </FormControl>
                    </Flex>
                  </Box>
                  {honoraryType.search('work') >= 0 ? (
                    <>
                      {parcelling ? (
                        <Box sx={{ marginTop: '16px' }}>
                          <Typography
                            variant="h6"
                            sx={{ marginBottom: '8px' }}
                            style={{
                              color:
                                parcelling && numberOfInstallments === '' ? '#FF0000' : 'black',
                            }}
                          >
                            {'Parcelamento'}
                          </Typography>
                          <Flex style={{ flexDirection: 'column' }}>
                            <FormControl sx={{ width: '314px', height: '40px' }}>
                              <Select
                                displayEmpty
                                value={numberOfInstallments}
                                inputProps={{
                                  style: {
                                    height: '100%',
                                    color: colors.icons,
                                  },
                                }}
                                MenuProps={{
                                  PaperProps: {
                                    style: {
                                      maxHeight: 32 * 4.5 + 8,
                                      width: 250,
                                    },
                                  },
                                }}
                                onChange={(e: any) => setNumberOfInstallments(e.target.value)}
                              >
                                <MenuItem disabled value="">
                                  <>{'Número de Parcelas'}</>
                                </MenuItem>
                                {instalmentOptions.map((value: string) => (
                                  <MenuItem key={value} value={value}>
                                    {value}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Flex>
                        </Box>
                      ) : null}
                    </>
                  ) : null}
                </FormControl>
              )}

              {honoraryType == 'success' && (
                <FormControl>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ marginBottom: '8px' }}
                      style={{
                        color:
                          honoraryType === 'success' && valueOfPercent === '' ? '#FF0000' : 'black',
                      }}
                    >
                      {'Valor de Honorários Percentuais'}
                    </Typography>
                    <Flex style={{ flexDirection: 'column' }}>
                      <FormControl sx={{ width: '314px' }}>
                        <Input
                          id="PercentageHonoraryValue"
                          placeholder="%"
                          min="0"
                          value={valueOfPercent}
                          onChange={(e: any) => {
                            const value = e.target.value ? e.target.value : '';
                            setValueOfPercent(percentMask(value));
                          }}
                        />
                      </FormControl>
                    </Flex>
                  </Box>
                </FormControl>
              )}

              {honoraryType == 'both' && (
                <FormControl>
                  <Box>
                    <Typography variant="h6" mb={'8px'}>
                      {'Valor de Honorários Fixos'}
                    </Typography>
                    <Flex style={{ flexDirection: 'column' }}>
                      <Box sx={{ width: '314px' }}>
                        <Input
                          id="honoraryValue"
                          placeholder="R$"
                          min="0"
                          value={valueOfFixed}
                          onChange={(e: any) => {
                            const inputValue = e.target.value;

                            setValueOfFixed(`R$ ${moneyMask(inputValue)}`);
                          }}
                          onInput={(e: any) => {
                            const inputValue = e.target.value;
                            setValueOfFixed(`R$ ${moneyMask(inputValue)}`);
                          }}
                        />
                      </Box>
                      <Box mt={'16px'}>
                        <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                          {'Valor de Honorários Percentuais'}
                        </Typography>
                        <Flex style={{ flexDirection: 'column' }}>
                          <FormControl sx={{ width: '314px' }}>
                            <Input
                              id="PercentageHonoraryValue"
                              placeholder="%"
                              min="0"
                              value={valueOfPercent}
                              onChange={(e: any) => {
                                const value = e.target.value ? e.target.value : '';
                                setValueOfPercent(percentMask(value));
                              }}
                            />
                          </FormControl>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                  {honoraryType.search('both') >= 0 ? (
                    <>
                      {parcelling ? (
                        <Box mt={'16px'}>
                          <Typography
                            variant="h6"
                            sx={{ marginBottom: '8px' }}
                            style={{
                              color:
                                parcelling && numberOfInstallments === '' ? '#FF0000' : 'black',
                            }}
                          >
                            {'Parcelamento'}
                          </Typography>
                          <Flex style={{ flexDirection: 'column' }}>
                            <FormControl sx={{ width: '314px', height: '40px' }}>
                              <Select
                                displayEmpty
                                value={numberOfInstallments}
                                inputProps={{
                                  style: {
                                    height: '100%',

                                    color: colors.icons,
                                  },
                                }}
                                MenuProps={{
                                  PaperProps: {
                                    style: {
                                      maxHeight: 32 * 4.5 + 8,
                                      width: 250,
                                    },
                                  },
                                }}
                                onChange={(e: any) => setNumberOfInstallments(e.target.value)}
                              >
                                <MenuItem disabled value="">
                                  <>{'Número de Parcelas'}</>
                                </MenuItem>
                                {instalmentOptions.map((value: string) => (
                                  <MenuItem key={value} value={value}>
                                    {value}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Flex>
                        </Box>
                      ) : null}
                    </>
                  ) : null}
                </FormControl>
              )}
            </OptionsArea>
          ) : null}
        </Flex>
      </Container>
    </>
  );
};

export default forwardRef(WorkStepTwo);
