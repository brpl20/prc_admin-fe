import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Chip, IconButton, Menu, MenuItem, Button, Divider, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit, History, Lock, LockOpen, Publish, Unpublished, MoreVert, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import WikiService, { WikiPage } from '@/services/wiki';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DOMPurify from 'dompurify';

interface WikiPageViewProps {
  teamId: number;
  slug: string;
  onEdit?: () => void;
}

const WikiPageView: React.FC<WikiPageViewProps> = ({ teamId, slug, onEdit }) => {
  const router = useRouter();
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    loadPage();
  }, [teamId, slug]);

  const loadPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WikiService.getPage(teamId, slug);
      setPage(data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePublishToggle = async () => {
    if (!page) return;
    
    try {
      if (page.isPublished) {
        await WikiService.unpublishPage(teamId, slug);
      } else {
        await WikiService.publishPage(teamId, slug);
      }
      await loadPage();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleLockToggle = async () => {
    if (!page) return;
    
    try {
      if (page.isLocked) {
        await WikiService.unlockPage(teamId, slug);
      } else {
        await WikiService.lockPage(teamId, slug);
      }
      await loadPage();
    } catch (err) {
      console.error('Failed to toggle lock status:', err);
    }
  };

  const handleDelete = async () => {
    if (!page) return;
    
    try {
      await WikiService.deletePage(teamId, slug);
      router.push('/wiki');
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
    setDeleteConfirmOpen(false);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    setAnchorEl(null);
  };

  const handleHistory = () => {
    router.push(`/wiki/${slug}/history`);
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

  if (!page) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Página não encontrada
      </Alert>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/wiki">
          Wiki
        </Link>
        {page.parent && (
          <Link underline="hover" color="inherit" href={`/wiki/${page.parent.slug}`}>
            {page.parent.title}
          </Link>
        )}
        <Typography color="text.primary">{page.title}</Typography>
      </Breadcrumbs>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {page.title}
            </Typography>
            
            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
              {page.isPublished && (
                <Chip label="Publicado" color="success" size="small" />
              )}
              {page.isLocked && (
                <Chip label="Bloqueado" color="warning" size="small" icon={<Lock />} />
              )}
              {page.categories?.map(category => (
                <Chip
                  key={category.id}
                  label={category.name}
                  size="small"
                  sx={{ bgcolor: category.color || 'default' }}
                />
              ))}
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            {onEdit && !page.isLocked && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={onEdit}
              >
                Editar
              </Button>
            )}
            
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleHistory}>
                <History sx={{ mr: 1 }} /> Histórico
              </MenuItem>
              <MenuItem onClick={handlePublishToggle}>
                {page.isPublished ? (
                  <>
                    <Unpublished sx={{ mr: 1 }} /> Despublicar
                  </>
                ) : (
                  <>
                    <Publish sx={{ mr: 1 }} /> Publicar
                  </>
                )}
              </MenuItem>
              <MenuItem onClick={handleLockToggle}>
                {page.isLocked ? (
                  <>
                    <LockOpen sx={{ mr: 1 }} /> Desbloquear
                  </>
                ) : (
                  <>
                    <Lock sx={{ mr: 1 }} /> Bloquear
                  </>
                )}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                <Delete sx={{ mr: 1 }} /> Excluir
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        <Box sx={{ 
          '& h1': { fontSize: '2rem', mb: 2 },
          '& h2': { fontSize: '1.5rem', mb: 1.5, mt: 3 },
          '& h3': { fontSize: '1.25rem', mb: 1, mt: 2 },
          '& p': { mb: 1.5, lineHeight: 1.7 },
          '& ul, & ol': { mb: 1.5, pl: 3 },
          '& li': { mb: 0.5 },
          '& blockquote': { 
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            pl: 2,
            py: 1,
            my: 2,
            bgcolor: 'action.hover'
          },
          '& code': {
            bgcolor: 'action.hover',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontFamily: 'monospace'
          },
          '& pre': {
            bgcolor: 'action.hover',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            '& code': {
              bgcolor: 'transparent',
              p: 0
            }
          }
        }}>
          <div dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(page.content || '<p>Esta página está vazia.</p>') 
          }} />
        </Box>

        <Divider sx={{ mt: 4, mb: 2 }} />

        {/* Metadata */}
        <Box display="flex" justifyContent="space-between" color="text.secondary" fontSize="0.875rem">
          <Box>
            Criado por {page.createdBy?.profileAdmin?.name || page.createdBy?.email} em{' '}
            {format(new Date(page.createdAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </Box>
          {page.updatedAt !== page.createdAt && (
            <Box>
              Última atualização por {page.updatedBy?.profileAdmin?.name || page.updatedBy?.email} em{' '}
              {format(new Date(page.updatedAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a página "{page?.title}"? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WikiPageView;