import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { Article, Add } from '@mui/icons-material';
import WikiLayout from '@/components/Wiki/WikiLayout';
import WikiService, { WikiPage } from '@/services/wiki';
import { useTeam } from '@/contexts/TeamContext';
import Layout from '@/components/Layout';

const WikiHomePage: NextPage = () => {
  const router = useRouter();
  const { currentTeam } = useTeam();
  const [recentPages, setRecentPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentPages = useCallback(async () => {
    if (!currentTeam?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const pages = await WikiService.getPages(currentTeam.id, { publishedOnly: true });
      // Get the 6 most recent pages
      setRecentPages(pages.slice(0, 6));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao carregar páginas');
    } finally {
      setLoading(false);
    }
  }, [currentTeam?.id]);

  useEffect(() => {
    if (currentTeam?.id) {
      loadRecentPages();
    }
  }, [currentTeam?.id, loadRecentPages]);

  const handlePageClick = (page: WikiPage) => {
    router.push(`/wiki/${page.slug}`);
  };

  const handleNewPage = () => {
    router.push('/wiki/new');
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
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1">
              Wiki - {currentTeam.name}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewPage}
            >
              Nova Página
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            Páginas Recentes
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : recentPages.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Article sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Nenhuma página encontrada
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Comece criando sua primeira página wiki
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleNewPage}
                  sx={{ mt: 2 }}
                >
                  Criar Primeira Página
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {recentPages.map((page) => (
                <Grid item xs={12} sm={6} md={4} key={page.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {page.title}
                      </Typography>
                      {page.categories && page.categories.length > 0 && (
                        <Box mb={1}>
                          {page.categories.map((category) => (
                            <Chip
                              key={category.id}
                              label={category.name}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Atualizado por {page.updatedBy?.profileAdmin?.name || page.updatedBy?.email}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handlePageClick(page)}>
                        Ler Mais
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </WikiLayout>
    </Layout>
  );
};

export default WikiHomePage;