import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { CustomerContext } from '@/contexts/CustomerContext';
import { WorkContext } from '@/contexts/WorkContext';
import { getWorkById } from '@/services/works';
import { getProfileAdminById } from '@/services/admins';
import { getOfficeById } from '@/services/offices';
import { getCustomerById } from '@/services/customers';

import dynamic from 'next/dynamic';
import { Footer } from '@/components';
import User from '@/components/Registrations/user';
import Office from '@/components/Registrations/office';
import RegistrationScreen from '@/components/Registrations';
import Counter from '@/components/Registrations/customer/counter';
import { workSteps, PFCustomerSteps, PJCustomerSteps } from '@/utils/constants';
import Representative from '@/components/Registrations/customer/representative';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Registration = () => {
  const router = useRouter();
  const { type, id } = router.query;
  const { setCustomerForm, setIsLoading, isLoading } = useContext(CustomerContext);
  const { setWorkForm } = useContext(WorkContext);
  const [form, setForm] = useState({} as any);

  useEffect(() => {
    const handleEditCustomer = async () => {
      setIsLoading(true);

      const response = await getCustomerById(id as string);

      if (response) {
        setCustomerForm(response);
      }

      setIsLoading(false);
    };

    const handleEditWork = async () => {
      setIsLoading(true);

      const response = await getWorkById(id as string);

      if (response) {
        setWorkForm(response);
      }

      setIsLoading(false);
    };

    const handleEditUser = async () => {
      setIsLoading(true);

      const response = await getProfileAdminById(id as string);

      if (response) {
        setForm(response);
      }

      setIsLoading(false);
    };

    const handleEditOffice = async () => {
      setIsLoading(true);

      const response = await getOfficeById(id as string);

      if (response) {
        setForm(response);
      }

      setIsLoading(false);
    };

    if (type && type.includes('iente')) {
      handleEditCustomer();
    }

    if (type && type.includes('abalho')) {
      handleEditWork();
    }

    if (type && type.includes('uario')) {
      handleEditUser();
    }

    if (type && type.includes('critorio')) {
      handleEditOffice();
    }
  }, [type, id, setCustomerForm, setWorkForm]);

  return (
    <Layout>
      {type === 'trabalho' && (
        <RegistrationScreen registrationType={'trabalho'} titleSteps={workSteps} />
      )}

      {type === 'cliente/pessoa_fisica' && (
        <RegistrationScreen
          registrationType={'cliente/pessoa_fisica'}
          titleSteps={PFCustomerSteps}
        />
      )}

      {type === 'cliente/pessoa_juridica' && (
        <RegistrationScreen
          registrationType={'cliente/pessoa_juridica'}
          titleSteps={PJCustomerSteps}
        />
      )}

      {type === 'cliente/contador' && <Counter pageTitle={'Alterar Contador'} />}

      {type === 'cliente/representante' && <Representative pageTitle={'Alterar Representante'} />}

      {type === 'usuario' && <User dataToEdit={form} isLoading={isLoading} />}

      {type === 'escritorio' && <Office dataToEdit={form} isLoading={isLoading} />}

      <Footer />
    </Layout>
  );
};

export default Registration;
