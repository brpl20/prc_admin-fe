import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import dynamic from 'next/dynamic';
import { Footer } from '@/components';
import RegistrationScreen from '@/components/Registrations';
import Counter from '@/components/Registrations/customer/counter';
import User from '@/components/Registrations/user';
import Office from '@/components/Registrations/office';
import { workSteps, PFCustomerSteps, PJCustomerSteps } from '@/utils/constants';
import Representative from '@/components/Registrations/customer/representative';
import { PageTitleContext } from '@/contexts/PageTitleContext';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Registration = () => {
  const { customerTitle } = useContext(PageTitleContext);

  const router = useRouter();
  const params = router.query.type;

  return (
    <Layout>
      {params === 'trabalho' && (
        <RegistrationScreen registrationType={'trabalho'} titleSteps={workSteps} />
      )}

      {params === 'cliente/pessoa_fisica' && (
        <RegistrationScreen
          registrationType={'cliente/pessoa_fisica'}
          titleSteps={PFCustomerSteps}
        />
      )}

      {params === 'cliente/pessoa_juridica' && (
        <RegistrationScreen
          registrationType={'cliente/pessoa_juridica'}
          titleSteps={PJCustomerSteps}
        />
      )}

      {params === 'cliente/contador' && <Counter pageTitle={'Cadastro de Contador'} />}

      {params === 'cliente/representante' && (
        <Representative pageTitle={'Cadastro de Representante'} />
      )}

      {params === 'usuario' && <User />}

      {params === 'escritorio' && <Office />}

      <Footer />
    </Layout>
  );
};

export default Registration;
