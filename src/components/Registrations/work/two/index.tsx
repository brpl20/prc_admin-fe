import {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
} from 'react';

import { Notification } from '@/components';
import { Container } from './styles';

import { WorkContext } from '@/contexts/WorkContext';

import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { HonoraryTypeSelection } from './HonoraryTypeSelection';
import { FixedHonoraryInput } from './FixedHonoraryInput';
import { ParcelingSection } from './ParcelingSection';
import { PercentHonoraryInput } from './PercentHonoraryInput';
import { SocialSecurityInput } from './SocialSecurityInput';
import { ParcelingInput } from './ParcelingInput';
import { LoadingOverlay } from '../one/styles';

export interface IRefWorkStepTwoProps {
  handleSubmitForm: () => void;
}

interface IStepTwoProps {
  nextStep: () => void;
}

const stepTwoSchema = z.object({
  honoraryType: z.string().min(2),
});

const WorkStepTwo: ForwardRefRenderFunction<IRefWorkStepTwoProps, IStepTwoProps> = (
  { nextStep },
  ref,
) => {
  const [loading, setLoading] = useState(true);
  const { workForm, setWorkForm, updateWorkForm, setUdateWorkForm } = useContext(WorkContext);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [honoraryType, setHonoraryType] = useState('');
  const [valueOfFixed, setValueOfFixed] = useState('');
  const [workPrev, setWorkPrev] = useState<number | null>(null);
  const [valueOfPercent, setValueOfPercent] = useState('');
  const [parcelling, setParcelling] = useState(false);
  const [numberOfInstallments, setNumberOfInstallments] = useState('');

  const route = useRouter();
  const isSocialSecurity = workForm.subject === 'social_security';
  const showFixedInput = ['work', 'both'].includes(honoraryType);
  const showPercentInput = ['success', 'both'].includes(honoraryType);
  const showParceling = ['work', 'both'].includes(honoraryType) && parcelling;

  const handleSubmitForm = () => {
    try {
      validateForm();
      const honoraryAttributes = buildHonoraryAttributes();
      updateWorkData(honoraryAttributes);
      nextStep();
    } catch (error: any) {
      handleFormError(error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const localStorageData = localStorage.getItem('WORK/Two');
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);
        applyData(parsedData);
        return;
      }

      if (workForm.data) {
        handleDataForm();
      } else if (workForm.draftWork && workForm.draftWork.id) {
        handleDraftWork();
      }
    } finally {
      setLoading(false);
    }
  };

  const applyData = (data: any) => {
    if (data.honorary_attributes) {
      const honorary = data.honorary_attributes;
      setHonoraryType(honorary.honorary_type);

      if (honorary.fixed_honorary_value) {
        setValueOfFixed(
          `R$ ${parseFloat(honorary.fixed_honorary_value)
            .toFixed(2)
            .replace('.', ',')
            .replace(/\d(?=(\d{3})+,)/g, '$&.')}`,
        );
      }

      setValueOfPercent(honorary.percent_honorary_value || '');
      setWorkPrev(honorary.work_prev || null);
      setParcelling(honorary.parcelling || false);

      if (honorary.parcelling_value) {
        setNumberOfInstallments(`${honorary.parcelling_value}x`);
      }
    }
  };

  const handleDataForm = () => {
    const attributes = workForm.data.attributes;
    if (attributes.honorary) {
      applyData({ honorary_attributes: attributes.honorary });
    }
  };

  const handleDraftWork = () => {
    const draftWork = workForm.draftWork;
    if (draftWork.attributes?.honorary) {
      applyData({ honorary_attributes: draftWork.attributes.honorary });
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const validateForm = () => {
    stepTwoSchema.parse({ honoraryType });

    if (honoraryType === 'success' && !valueOfPercent) {
      throw new Error('Preencha o valor percentual');
    }

    if (honoraryType === 'work' && !valueOfFixed) {
      throw new Error('Preencha o valor fixo');
    }

    if (honoraryType === 'both' && (!valueOfFixed || !valueOfPercent)) {
      throw new Error('Preencha ambos os valores');
    }

    if (isSocialSecurity && ['work', 'both'].includes(honoraryType) && workPrev === null) {
      throw new Error('Preencha o valor previdenciário');
    }

    if (parcelling && !numberOfInstallments) {
      throw new Error('Selecione o número de parcelas');
    }
  };

  const buildHonoraryAttributes = () => {
    const baseAttributes = {
      honorary_type: honoraryType,
      fixed_honorary_value: valueOfFixed ? parseFloat(valueOfFixed.replace(/\D/g, '')) / 100 : null,
      percent_honorary_value: valueOfPercent || null,
      work_prev: workPrev,
      parcelling,
      parcelling_value: numberOfInstallments
        ? parseInt(numberOfInstallments.replace('x', ''))
        : null,
    };

    if (route.asPath.includes('alterar') && workForm.data?.attributes?.honorary?.id) {
      return { ...baseAttributes, id: workForm.data.attributes.honorary.id };
    }

    return baseAttributes;
  };

  const updateWorkData = (honoraryAttributes: any) => {
    const data = { honorary_attributes: honoraryAttributes };

    if (route.pathname === '/alterar') {
      const dataAux = { ...updateWorkForm, ...data };
      setUdateWorkForm(dataAux);
      saveDataLocalStorage(dataAux);
    } else {
      const mergedData = { ...workForm, ...data };
      saveDataLocalStorage(mergedData);
      setWorkForm(mergedData);
    }
  };

  const handleFormError = (error: any) => {
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: Record<string, string> = {};

    setMessage(error.message || 'Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);

    for (const field in newErrors) {
      errorObject[field] = newErrors[field][0];
    }
    setErrors(errorObject);
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/Two', JSON.stringify(data));
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    if (honoraryType === 'success') {
      setValueOfFixed('');
      setWorkPrev(null);
    } else if (honoraryType === 'work') {
      setValueOfPercent('');
      setWorkPrev(null);
    } else if (honoraryType === 'both') {
      setWorkPrev(null);
    }
  }, [honoraryType]);

  return (
    <>
      <Notification
        open={openSnackbar}
        message={message}
        severity={type}
        onClose={() => setOpenSnackbar(false)}
      />

      <Container loading={loading}>
        {loading && (
          <LoadingOverlay>
            <CircularProgress size={30} style={{ color: '#01013D' }} />
          </LoadingOverlay>
        )}

        <div className="flex gap-[16px]">
          <div className="min-w-fit flex flex-col gap-[24px]">
            <HonoraryTypeSelection
              honoraryType={honoraryType}
              onChange={setHonoraryType}
              error={errors.honoraryType}
            />

            {showFixedInput && (
              <ParcelingSection
                parcelling={parcelling}
                onParcellingChange={setParcelling}
                onInstallmentsChange={setNumberOfInstallments}
              />
            )}
          </div>

          <div
            className={`rounded-[2px] w-full p-[10px] min-h-full flex flex-col gap-[16px]  ${
              showFixedInput || showParceling || showPercentInput
                ? 'border border-solid border-[#01013D]'
                : 'border-0'
            }`}
          >
            {showFixedInput && (
              <FixedHonoraryInput
                value={valueOfFixed}
                onChange={setValueOfFixed}
                error={!valueOfFixed}
              />
            )}

            {showParceling && (
              <ParcelingInput
                instalmentOptions={Array.from({ length: 12 }, (_, i) => `${i + 1}x`)}
                numberOfInstallments={numberOfInstallments}
                onInstallmentsChange={setNumberOfInstallments}
              />
            )}

            {showPercentInput && (
              <PercentHonoraryInput
                value={valueOfPercent}
                onChange={setValueOfPercent}
                error={!valueOfPercent && honoraryType === 'success'}
              />
            )}

            {isSocialSecurity && showFixedInput && (
              <SocialSecurityInput
                value={workPrev}
                onChange={setWorkPrev}
                error={workPrev === null}
              />
            )}
          </div>
        </div>
      </Container>
    </>
  );
};

export default forwardRef(WorkStepTwo);
