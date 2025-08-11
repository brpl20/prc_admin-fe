import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import { Notification } from '@/components';
import { 
  getDashboardStats, 
  getSystemSettingsAdmin, 
  updateSystemSetting,
  DashboardStats,
  SystemSettingsResponse,
  SystemSettingItem 
} from '@/services/superAdmin';

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettingsResponse | null>(null);
  const [editingSettings, setEditingSettings] = useState<{ [key: number]: boolean }>({});
  const [settingValues, setSettingValues] = useState<{ [key: number]: number }>({});

  // Notification state
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, settings] = await Promise.all([
        getDashboardStats(),
        getSystemSettingsAdmin()
      ]);
      
      setDashboardStats(stats);
      setSystemSettings(settings);
      
      // Initialize editing values
      const initialValues: { [key: number]: number } = {};
      settings.settings.forEach(setting => {
        initialValues[setting.id] = setting.value;
      });
      setSettingValues(initialValues);
      
    } catch (error) {
      setMessage('Erro ao carregar dados do dashboard');
      setType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSetting = (settingId: number) => {
    setEditingSettings(prev => ({ ...prev, [settingId]: true }));
  };

  const handleCancelEdit = (settingId: number, originalValue: number) => {
    setEditingSettings(prev => ({ ...prev, [settingId]: false }));
    setSettingValues(prev => ({ ...prev, [settingId]: originalValue }));
  };

  const handleSaveSetting = async (setting: SystemSettingItem) => {
    try {
      const newValue = settingValues[setting.id];
      await updateSystemSetting(setting.id, { value: newValue });
      
      setEditingSettings(prev => ({ ...prev, [setting.id]: false }));
      
      // Reload data to get updated values
      await loadDashboardData();
      
      setMessage('Configuração atualizada com sucesso');
      setType('success');
      setOpenSnackbar(true);
      
    } catch (error) {
      setMessage('Erro ao atualizar configuração');
      setType('error');
      setOpenSnackbar(true);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  const getSettingTitle = (key: string) => {
    switch (key) {
      case 'minimum_wage':
        return 'Salário Mínimo';
      case 'inss_ceiling':
        return 'Teto INSS';
      default:
        return key.replace('_', ' ').toUpperCase();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={type}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          🔧 Painel Super Administrador
        </Typography>

        {/* System Overview */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          📊 Visão Geral do Sistema
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {dashboardStats?.system_overview.total_admins}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total de Admins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {dashboardStats?.system_overview.total_teams}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total de Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {dashboardStats?.system_overview.total_customers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total de Clientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {dashboardStats?.system_overview.total_works}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total de Trabalhos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          📈 Atividade Recente
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body1" fontWeight="bold">
                  Novos usuários (mês)
                </Typography>
                <Typography variant="h6" color="success.main">
                  +{dashboardStats?.recent_activity.new_users_this_month}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body1" fontWeight="bold">
                  Novos trabalhos (semana)
                </Typography>
                <Typography variant="h6" color="info.main">
                  +{dashboardStats?.recent_activity.new_works_this_week}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body1" fontWeight="bold">
                  Teams ativas
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {dashboardStats?.recent_activity.active_teams}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* System Settings */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          ⚙️ Configurações do Sistema
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Ano atual:</strong> {systemSettings?.current_year} | 
          Estas configurações afetam todo o sistema e são usadas nos cálculos de pro-labore.
        </Alert>

        <Grid container spacing={3}>
          {systemSettings?.settings.map((setting) => (
            <Grid item xs={12} md={6} key={setting.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {getSettingTitle(setting.key)}
                    </Typography>
                    <Chip 
                      label={setting.year} 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {setting.description}
                  </Typography>
                  
                  {editingSettings[setting.id] ? (
                    <Box>
                      <TextField
                        type="number"
                        fullWidth
                        label="Valor"
                        value={settingValues[setting.id] || ''}
                        onChange={(e) => setSettingValues(prev => ({ 
                          ...prev, 
                          [setting.id]: parseFloat(e.target.value) || 0 
                        }))}
                        inputProps={{ step: 0.01, min: 0 }}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                        }}
                        sx={{ mb: 2 }}
                      />
                      
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleSaveSetting(setting)}
                        >
                          Salvar
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleCancelEdit(setting.id, setting.value)}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                        {formatCurrency(setting.value)}
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditSetting(setting.id)}
                      >
                        Editar Valor
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default SuperAdminDashboard;