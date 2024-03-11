import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

import dynamic from 'next/dynamic';
import { Footer } from '@/components';
import RegistrationScreen from '@/components/Registrations';
import Counter from '@/components/Registrations/customer/counter';
import User from '@/components/Registrations/user';
import Office from '@/components/Registrations/office';
import { workSteps, PFCustomerSteps, PJCustomerSteps } from '@/utils/constants';
import Representative from '@/components/Registrations/customer/representative';
import { useSession } from 'next-auth/react';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Registration = () => {
  const { data: session } = useSession();

  const router = useRouter();
  const params = router.query.type;

  return (
    <Layout>
      {params === 'trabalho' && (
        <RegistrationScreen
          registrationType={'trabalho'}
          pageTitle={'Cadastro de Trabalho'}
          titleSteps={workSteps}
        />
      )}

      {params === 'cliente/pessoa_fisica' && (
        <RegistrationScreen
          registrationType={'cliente/pessoa_fisica'}
          pageTitle={'Cadastro Pessoa Física'}
          titleSteps={PFCustomerSteps}
        />
      )}

      {params === 'cliente/pessoa_juridica' && (
        <RegistrationScreen
          registrationType={'cliente/pessoa_juridica'}
          pageTitle={'Cadastro Pessoa Jurídica'}
          titleSteps={PJCustomerSteps}
        />
      )}

      {params === 'cliente/contador' && <Counter pageTitle={'Cadastro de Contador'} />}

      {params === 'cliente/representante' && (
        <Representative pageTitle={'Cadastro de Representante'} />
      )}

      {params === 'usuario' && <User pageTitle={'Cadastro de Usuário'} />}

      {params === 'escritorio' && <Office pageTitle={'Cadastro de Escritório'} />}

      <Footer />
    </Layout>
  );
};

export default Registration;
