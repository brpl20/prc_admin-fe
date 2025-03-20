import React, {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';

import { colors } from '@/styles/globals';
import { Notification } from '@/components';
import { Container, Input, OptionsArea } from './styles';

import { animateScroll as scroll } from 'react-scroll';

import CustomTooltip from '@/components/Tooltip';
import { MdOutlineInfo } from 'react-icons/md';
import { WorkContext } from '@/contexts/WorkContext';

import { FormControlLabel, Typography, Radio, Select, MenuItem } from '@mui/material';
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
  setFormLoading: Dispatch<SetStateAction<boolean>>;
}

const stepTwoSchema = z.object({
  honoraryType: z.string().min(2),
});

const WorkStepTwo: ForwardRefRenderFunction<IRefWorkStepTwoProps, IStepTwoProps> = (
  { nextStep, setFormLoading },
  ref,
) => {
  const [isVisibleOptionsArea, setIsVisibleOptionsArea] = useState(false);
  const { workForm, setWorkForm, updateWorkForm, setUdateWorkForm } = useContext(WorkContext);
  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [honoraryType, setHonoraryType] = useState('');
  const [valueOfFixed, setValueOfFixed] = useState<string>();
  const [workPrev, setWorkPrev] = useState<number | null>(null);
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

    newValue.search('bonus') < 0 ? setIsVisibleOptionsArea(true) : setIsVisibleOptionsArea(false);
  };

  const handleSubmitForm = () => {
    try {
      stepTwoSchema.parse({
        honoraryType: honoraryType,
      });

      if (honoraryType === 'success' && valueOfPercent === '') {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      if (honoraryType === 'work' && !workPrev && workForm.subject === 'social_security') {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      if (honoraryType === 'work' && valueOfFixed === '') {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      if (
        (honoraryType === 'both' && valueOfFixed === '') ||
        (honoraryType === 'both' && valueOfPercent === '') ||
        (honoraryType === 'both' && !workPrev && workForm.subject === 'social_security')
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
          work_prev: workPrev,
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
          work_prev: workPrev,
          parcelling_value: numberOfInstallments.replace('x', ''),
          honorary_type: honoraryType,
        };
      }

      if (route.pathname == '/alterar') {
        let dataAux = {
          ...updateWorkForm,
          honorary_attributes: honorary_attributes,
        };

        setUdateWorkForm(dataAux);
        saveDataLocalStorage(dataAux);
      }

      const data = {
        ...workForm,
        honorary_attributes: honorary_attributes,
      } as any;

      if (route.pathname !== '/alterar') {
        saveDataLocalStorage(data);
      }

      setWorkForm(data);
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
    // setFormLoading;
    const data = localStorage.getItem('WORK/Two');

    if (data) {
      const parsedData = JSON.parse(data);
      setHonoraryType(parsedData.honorary_attributes.honorary_type);
      setValueOfFixed(parsedData.honorary_attributes.fixed_honorary_value);
      setValueOfPercent(parsedData.honorary_attributes.percent_honorary_value);
      setWorkPrev(parsedData.honorary_attributes.work_prev);

      if (
        parsedData.honorary_attributes.parcelling_value &&
        Number(parsedData.honorary_attributes.parcelling_value) > 0
      ) {
        setParcelling(true);
      } else {
        setParcelling(false);
        setNumberOfInstallments('');
      }
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
    // setFormLoading(false);
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

            if (attributes.honorary.work_prev) {
              setWorkPrev(attributes.honorary.work_prev);
            }

            if (attributes.honorary.parcelling_value) {
              setNumberOfInstallments(`${attributes.honorary.parcelling_value}x`);
            }

            if (attributes.honorary.parcelling === true) {
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
        setWorkPrev(attributes.honorary.work_prev);
        setNumberOfInstallments(
          attributes.honorary.parcelling_value ? `${attributes.honorary.parcelling_value}x` : '',
        );

        if (attributes.honorary.parcelling === true) {
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
        <div className="flex flex-row mt-4 min-h-[348px]">
          <div className="flex flex-col w-[400px]">
            <div className="flex">
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
            </div>

            <div>
              <div className="flex items-center">
                <FormControlLabel
                  sx={{ width: '200px' }}
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
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <FormControlLabel
                  sx={{ width: '200px' }}
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
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <FormControlLabel
                  sx={{ width: '200px' }}
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
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <FormControlLabel
                  sx={{ width: '200px' }}
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
              </div>
            </div>

            {honoraryType.search('work') >= 0 || honoraryType.search('both') >= 0 ? (
              <div className="mt-4">
                <div className="flex items-center">
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
                </div>

                <div>
                  <FormControlLabel
                    control={
                      <Radio
                        size="small"
                        value={true}
                        checked={parcelling}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const isTrue = e.target.value === 'true';
                          setParcelling(isTrue);
                        }}
                      />
                    }
                    label="Sim"
                  />
                </div>

                <div>
                  <FormControlLabel
                    control={
                      <Radio
                        size="small"
                        value={false}
                        checked={!parcelling}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const isFalse = e.target.value === 'false';
                          setParcelling(!isFalse);
                          setNumberOfInstallments('');
                        }}
                      />
                    }
                    label="Não"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {isVisibleOptionsArea ? (
            <OptionsArea>
              {honoraryType == 'work' && (
                <div>
                  <div>
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Valor de Honorários Fixos'}
                    </Typography>

                    <div className="flex flex-col">
                      <div>
                        <Input
                          style={{
                            borderColor: valueOfFixed === '' ? '#FF0000' : 'black',
                          }}
                          id="honoraryValue"
                          placeholder="R$"
                          value={valueOfFixed}
                          onChange={(e: any) => {
                            const inputValue = e.target.value;
                            if (inputValue.length === 0) {
                              setValueOfFixed('');
                              return;
                            }
                            setValueOfFixed(`R$ ${moneyMask(inputValue)}`);
                          }}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {workForm.subject === 'social_security' ? (
                    <div className="flex flex-col mt-4">
                      <Typography variant="h6" mb={'8px'}>
                        {'Valor de Honorários Previdenciários (Parcelas de Benefícios)'}
                      </Typography>

                      <div>
                        <Input
                          style={{
                            borderColor: !workPrev ? '#FF0000' : 'black',
                          }}
                          id="honoraryValue"
                          placeholder="0"
                          value={workPrev}
                          onChange={(e: any) => {
                            const inputValue = Number(e.target.value);

                            if (inputValue === 0) {
                              setWorkPrev(null);
                              return;
                            }
                            if (inputValue <= 99) {
                              setWorkPrev(inputValue);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {honoraryType.search('work') >= 0 ? (
                    <>
                      {parcelling ? (
                        <div className="mt-4">
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

                          <div className="flex flex-col w-[314px]">
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
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )}

              {honoraryType == 'success' && (
                <div>
                  <div>
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Valor de Honorários Percentuais'}
                    </Typography>
                    <div className="flex flex-col">
                      <div className="w-[314px]">
                        <Input
                          style={{
                            borderColor:
                              honoraryType === 'success' && valueOfPercent === ''
                                ? '#FF0000'
                                : 'black',
                          }}
                          id="PercentageHonoraryValue"
                          placeholder="%"
                          min="0"
                          value={valueOfPercent}
                          onChange={(e: any) => {
                            const value = e.target.value ? e.target.value : '';
                            setValueOfPercent(percentMask(value));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {honoraryType == 'both' && (
                <div>
                  <div className="flex flex-col">
                    <Typography variant="h6" mb={'8px'}>
                      {'Valor de Honorários Fixos'}
                    </Typography>

                    <div>
                      <Input
                        style={{
                          borderColor: valueOfFixed === '' ? '#FF0000' : 'black',
                        }}
                        id="honoraryValue"
                        placeholder="R$"
                        min="0"
                        value={valueOfFixed}
                        onChange={(e: any) => {
                          const inputValue = e.target.value;
                          if (inputValue.length === 0) {
                            setValueOfFixed('');
                            return;
                          }
                          setValueOfFixed(`R$ ${moneyMask(inputValue)}`);
                        }}
                        onInput={(e: any) => {
                          const inputValue = e.target.value;
                          if (inputValue.length === 0) {
                            setValueOfFixed('');
                            return;
                          }
                          setValueOfFixed(`R$ ${moneyMask(inputValue)}`);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="mt-4">
                      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                        {'Valor de Honorários Percentuais'}
                      </Typography>
                      <div className="flex flex-col">
                        <div className="w-[314px]">
                          <Input
                            style={{
                              borderColor: valueOfPercent === '' ? '#FF0000' : 'black',
                            }}
                            id="PercentageHonoraryValue"
                            placeholder="%"
                            min="0"
                            value={valueOfPercent}
                            onChange={(e: any) => {
                              const value = e.target.value ? e.target.value : '';
                              setValueOfPercent(percentMask(value));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {workForm.subject === 'social_security' ? (
                    <div className="flex flex-col mt-4">
                      <Typography variant="h6" mb={'8px'}>
                        {'Valor de Honorários Previdenciários (Parcelas de Benefícios)'}
                      </Typography>

                      <div>
                        <Input
                          style={{
                            borderColor: !workPrev ? '#FF0000' : 'black',
                          }}
                          id="honoraryValue"
                          placeholder="0"
                          value={workPrev}
                          onChange={(e: any) => {
                            const inputValue = Number(e.target.value);

                            if (inputValue === 0) {
                              setWorkPrev(null);
                              return;
                            }
                            if (inputValue <= 99) {
                              setWorkPrev(inputValue);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {honoraryType.search('both') >= 0 ? (
                    <>
                      {parcelling ? (
                        <div className="mt-4">
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
                          <div className="flex flex-col">
                            <div className="flex flex-col w-[314px]">
                              <Select
                                displayEmpty
                                value={numberOfInstallments}
                                MenuProps={{
                                  PaperProps: {
                                    style: {
                                      maxHeight: 32 * 4.5 + 8,
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
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )}
            </OptionsArea>
          ) : null}
        </div>
      </Container>
    </>
  );
};

export default forwardRef(WorkStepTwo);
