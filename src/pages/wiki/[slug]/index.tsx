import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import WikiLayout from '@/components/Wiki/WikiLayout';
import WikiPageView from '@/components/Wiki/WikiPageView';
import WikiPageEditor from '@/components/Wiki/WikiPageEditor';
import { useTeam } from '@/contexts/TeamContext';
import Layout from '@/components/Layout';
import { Alert } from '@mui/material';
import { WikiPage } from '@/services/wiki';

const WikiPageDetail: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { currentTeam } = useTeam();
  const [editMode, setEditMode] = useState(false);

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

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = (page: WikiPage) => {
    setEditMode(false);
    // Reload the page to show updated content
    router.reload();
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  return (
    <Layout>
      <WikiLayout teamId={currentTeam.id}>
        {editMode ? (
          <WikiPageEditor
            teamId={currentTeam.id}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <WikiPageView
            teamId={currentTeam.id}
            slug={slug}
            onEdit={handleEdit}
          />
        )}
      </WikiLayout>
    </Layout>
  );
};

export default WikiPageDetail;