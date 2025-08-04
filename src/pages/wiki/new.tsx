import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import WikiLayout from '@/components/Wiki/WikiLayout';
import WikiPageEditor from '@/components/Wiki/WikiPageEditor';
import { useTeam } from '@/contexts/TeamContext';
import Layout from '@/components/Layout';
import { Alert } from '@mui/material';
import { WikiPage } from '@/services/wiki';

const WikiNewPage: NextPage = () => {
  const router = useRouter();
  const { currentTeam } = useTeam();

  const handleSave = (page: WikiPage) => {
    router.push(`/wiki/${page.slug}`);
  };

  const handleCancel = () => {
    router.push('/wiki');
  };

  if (!currentTeam) {
    return (
      <Layout>
        <Alert severity="warning">
          Selecione um time para acessar o Wiki
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <WikiLayout teamId={currentTeam.id}>
        <WikiPageEditor
          teamId={currentTeam.id}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </WikiLayout>
    </Layout>
  );
};

export default WikiNewPage;