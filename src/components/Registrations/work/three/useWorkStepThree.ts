import { useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { WorkContext } from '@/contexts/WorkContext';
import { getAllPowers } from '@/services/powers';
import useFilteredPowers from './useFilteredPowers';
import { z } from 'zod';

interface IUseWorkStepThreeProps {
  nextStep: () => void;
}

const stepThreeSchema = z.object({
  power_ids: z.array(z.number()).min(1, { message: 'Selecione pelo menos um poder.' }),
});

export default function useWorkStepThree({ nextStep }: IUseWorkStepThreeProps) {
  const router = useRouter();
  const { workForm, setWorkForm, updateWorkForm, setUdateWorkForm } = useContext(WorkContext);

  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);

  const [powersSelected, setPowersSelected] = useState<number[]>([]);
  const [allPowers, setAllPowers] = useState<any[]>([]);

  const filteredPowers = useFilteredPowers(allPowers, workForm);

  const saveDataLocalStorage = useCallback((data: any) => {
    localStorage.setItem('WORK/Three', JSON.stringify(data));
  }, []);

  const handleFormError = useCallback((error: any) => {
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    for (const field in newErrors) {
      if (Object.prototype.hasOwnProperty.call(newErrors, field)) {
        console.error(`${field}: ${newErrors[field][0]}`);
      }
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      const powersResponse = await getAllPowers();
      const powersAttributes = powersResponse.data.map((p: any) => p.attributes).filter(Boolean);
      setAllPowers(powersAttributes);

      const localStorageData = localStorage.getItem('WORK/Three');
      let initialPowers: number[] = [];

      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);

        if (parsedData.power_ids) {
          initialPowers = parsedData.power_ids;
        }
      } else {
        const powersFromDraft = workForm.draftWork?.attributes?.powers?.map((p: any) => p.id);
        const powersFromData = workForm.data?.attributes?.powers?.map((p: any) => p.id);

        if (powersFromDraft && powersFromDraft.length > 0) {
          initialPowers = powersFromDraft;
        } else if (powersFromData && powersFromData.length > 0) {
          initialPowers = powersFromData;
        }
      }

      setPowersSelected(initialPowers);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
      setType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [workForm.subject, workForm.procedures, workForm.draftWork, workForm.data]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSubmitForm = useCallback(() => {
    try {
      stepThreeSchema.parse({ power_ids: powersSelected });

      const data = {
        ...workForm,
        power_ids: powersSelected,
        subject: workForm.subject,
        procedures: workForm.procedures,
      };

      if (router.pathname === '/alterar') {
        const updateData = { ...updateWorkForm, power_ids: powersSelected };
        setUdateWorkForm(updateData);
        saveDataLocalStorage(updateData);
      } else {
        saveDataLocalStorage(data);
      }

      setWorkForm(data);
      nextStep();
    } catch (err: any) {
      setMessage('Preencha todos os campos obrigatórios.');
      setType('error');
      setOpenSnackbar(true);
      handleFormError(err);
    }
  }, [
    powersSelected,
    workForm,
    router.pathname,
    updateWorkForm,
    nextStep,
    saveDataLocalStorage,
    setUdateWorkForm,
    setWorkForm,
    handleFormError,
  ]);

  return {
    message,
    type,
    openSnackbar,
    powersSelected,
    setPowersSelected,
    filteredPowers,
    loading,
    handleSubmitForm,
  };
}
