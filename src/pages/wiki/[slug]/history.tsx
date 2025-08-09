import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import WikiLayout from '@/components/Wiki/WikiLayout';
import WikiPageHistory from '@/components/Wiki/WikiPageHistory';
import { useTeam } from '@/contexts/TeamContext';
import Layout from '@/components/Layout';
import { Alert } from '@mui/material';

const WikiPageHistoryPage: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { currentTeam } = useTeam();

  if (!currentTeam) {
    return (
      <Layout>
        <Alert severity="warning">
          Selecione um time para acessar o Wiki
        </Alert>
      </Layout>
    );
  }

  if (!slug || typeof slug !== 'string') {
    return (
      <Layout>
        <WikiLayout teamId={currentTeam.id}>
          <Alert severity="error">
            Página não encontrada
          </Alert>
        </WikiLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <WikiLayout teamId={currentTeam.id}>
        <WikiPageHistory teamId={currentTeam.id} slug={slug} />
      </WikiLayout>
    </Layout>
  );
};

export default WikiPageHistoryPage;