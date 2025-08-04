import React, { useState, useEffect } from 'react';
import { Box, TextField, Paper, Button, FormControlLabel, Switch, Autocomplete, Chip, Typography, Divider, Alert, Tab, Tabs } from '@mui/material';
import { Save, Cancel, Preview } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import dynamic from 'next/dynamic';
import WikiService, { WikiPage, WikiCategory, WikiPageParams } from '@/services/wiki';
import DOMPurify from 'dompurify';

// Dynamic import for rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface WikiPageEditorProps {
  teamId: number;
  page?: WikiPage;
  onSave: (page: WikiPage) => void;
  onCancel: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wiki-tabpanel-${index}`}
      aria-labelledby={`wiki-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const WikiPageEditor: React.FC<WikiPageEditorProps> = ({ teamId, page, onSave, onCancel }) => {
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<WikiPageParams>({
    defaultValues: {
      title: page?.title || '',
      content: page?.content || '',
      slug: page?.slug || '',
      parentId: page?.parentId || null,
      isPublished: page?.isPublished || false,
      categoryIds: page?.categories?.map(c => c.id) || []
    }
  });

  const watchContent = watch('content');

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      const [categoriesData, pagesData] = await Promise.all([
        WikiService.getCategories(teamId),
        WikiService.getPages(teamId)
      ]);
      setCategories(categoriesData);
      setPages(pagesData.filter((p: WikiPage) => p.id !== page?.id));
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const onSubmit = async (data: WikiPageParams) => {
    try {
      setSaving(true);
      setError(null);

      let savedPage: WikiPage;
      if (page) {
        savedPage = await WikiService.updatePage(teamId, page.slug, data);
      } else {
        savedPage = await WikiService.createPage(teamId, data);
      }
      
      onSave(savedPage);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { errors?: string[] } } };
      setError(apiError.response?.data?.errors?.join(', ') || 'Erro ao salvar página');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h5" gutterBottom>
          {page ? 'Editar Página' : 'Nova Página'}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Título é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Título"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Slug (URL)"
                fullWidth
                helperText="Deixe em branco para gerar automaticamente"
              />
            )}
          />

          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={pages}
                getOptionLabel={(option) => option.title}
                value={pages.find(p => p.id === field.value) || null}
                onChange={(_, value) => field.onChange(value?.id || null)}
                renderInput={(params) => (
                  <TextField {...params} label="Página Pai" />
                )}
              />
            )}
          />

          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={categories}
                getOptionLabel={(option) => option.name}
                value={categories.filter(c => field.value?.includes(c.id))}
                onChange={(_, value) => field.onChange(value.map(v => v.id))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      style={{ backgroundColor: option.color || undefined }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Categorias" />
                )}
              />
            )}
          />

          <Box>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Editor" />
              <Tab label="Preview" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Box sx={{ 
                    '& .quill': { 
                      minHeight: '400px',
                      '& .ql-container': {
                        minHeight: '350px'
                      }
                    }
                  }}>
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                    />
                  </Box>
                )}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  minHeight: '400px',
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
                }}
              >
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(watchContent || '<p>Nenhum conteúdo para visualizar</p>') 
                }} />
              </Paper>
            </TabPanel>
          </Box>

          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                  />
                }
                label="Publicar página"
              />
            )}
          />

          {page && (
            <Controller
              name="changeSummary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Resumo das alterações"
                  fullWidth
                  multiline
                  rows={2}
                  helperText="Descreva brevemente as alterações realizadas"
                />
              )}
            />
          )}

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default WikiPageEditor;