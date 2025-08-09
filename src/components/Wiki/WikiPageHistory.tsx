import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Chip } from '@mui/material';
import { RestoreFromTrash, Compare, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';
import WikiService, { WikiPageRevision } from '@/services/wiki';
import DOMPurify from 'dompurify';

interface WikiPageHistoryProps {
  teamId: number;
  slug: string;
}

const WikiPageHistory: React.FC<WikiPageHistoryProps> = ({ teamId, slug }) => {
  const router = useRouter();
  const [revisions, setRevisions] = useState<WikiPageRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<WikiPageRevision | null>(null);
  const [compareRevisions, setCompareRevisions] = useState<[WikiPageRevision, WikiPageRevision] | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadRevisions();
  }, [teamId, slug]);

  const loadRevisions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WikiService.getPageRevisions(teamId, slug);
      setRevisions(data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRevision = (revision: WikiPageRevision) => {
    setSelectedRevision(revision);
  };

  const handleCompare = (revision1: WikiPageRevision, revision2: WikiPageRevision) => {
    setCompareRevisions([revision1, revision2]);
  };

  const handleRestore = async (revision: WikiPageRevision) => {
    if (!confirm(`Tem certeza que deseja restaurar a versão ${revision.versionNumber}?`)) {
      return;
    }

    try {
      setRestoring(true);
      await WikiService.revertPage(teamId, slug, revision.versionNumber);
      router.push(`/wiki/${slug}`);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao restaurar versão');
    } finally {
      setRestoring(false);
    }
  };

  const handleBack = () => {
    router.push(`/wiki/${slug}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={handleBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">
          Histórico de Revisões
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Versão</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Resumo</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {revisions.map((revision, index) => (
              <TableRow key={revision.id}>
                <TableCell>
                  <Chip 
                    label={`v${revision.versionNumber}`} 
                    size="small" 
                    color={index === 0 ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(revision.createdAt), "d/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {revision.createdBy?.profileAdmin?.name || revision.createdBy?.email}
                </TableCell>
                <TableCell>
                  {revision.changeSummary || '-'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      onClick={() => handleViewRevision(revision)}
                    >
                      Ver
                    </Button>
                    {index > 0 && (
                      <>
                        <Button
                          size="small"
                          startIcon={<Compare />}
                          onClick={() => handleCompare(revisions[0], revision)}
                        >
                          Comparar
                        </Button>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleRestore(revision)}
                          disabled={restoring}
                          title="Restaurar esta versão"
                        >
                          <RestoreFromTrash />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Revision Dialog */}
      <Dialog
        open={!!selectedRevision}
        onClose={() => setSelectedRevision(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Versão {selectedRevision?.versionNumber}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {selectedRevision?.title}
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mt: 2,
              maxHeight: '60vh',
              overflow: 'auto',
              '& h1': { fontSize: '1.75rem', mb: 1.5 },
              '& h2': { fontSize: '1.5rem', mb: 1, mt: 2 },
              '& h3': { fontSize: '1.25rem', mb: 0.75, mt: 1.5 },
              '& p': { mb: 1, lineHeight: 1.6 },
            }}
          >
            <div dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(selectedRevision?.content || '') 
            }} />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRevision(null)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compare Revisions Dialog */}
      <Dialog
        open={!!compareRevisions}
        onClose={() => setCompareRevisions(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Comparar Versões {compareRevisions?.[0].versionNumber} e {compareRevisions?.[1].versionNumber}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Versão {compareRevisions?.[0].versionNumber} (Atual)
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  maxHeight: '60vh',
                  overflow: 'auto' 
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {compareRevisions?.[0].title}
                </Typography>
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(compareRevisions?.[0].content || '') 
                }} />
              </Paper>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Versão {compareRevisions?.[1].versionNumber}
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  maxHeight: '60vh',
                  overflow: 'auto' 
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {compareRevisions?.[1].title}
                </Typography>
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(compareRevisions?.[1].content || '') 
                }} />
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareRevisions(null)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WikiPageHistory;