import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import WikiLayout from '@/components/Wiki/WikiLayout';
import WikiPageEditor from '@/components/Wiki/WikiPageEditor';
import { useTeam } from '@/contexts/TeamContext';
import Layout from '@/components/Layout';
import { Alert, CircularProgress, Box } from '@mui/material';
import WikiService, { WikiPage } from '@/services/wiki';

const WikiPageEdit: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { currentTeam } = useTeam();
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTeam?.id && slug && typeof slug === 'string') {
      loadPage();
    }
  }, [currentTeam?.id, slug]);

  const loadPage = async () => {
    if (!currentTeam?.id || !slug || typeof slug !== 'string') return;

    try {
      setLoading(true);
      setError(null);
      const data = await WikiService.getPage(currentTeam.id, slug);
      setPage(data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (savedPage: WikiPage) => {
    router.push(`/wiki/${savedPage.slug}`);
  };

  const handleCancel = () => {
    router.push(`/wiki/${slug}`);
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
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : page ? (
          <WikiPageEditor
            teamId={currentTeam.id}
            page={page}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <Alert severity="error">
            Página não encontrada
          </Alert>
        )}
      </WikiLayout>
    </Layout>
  );
};

export default WikiPageEdit;