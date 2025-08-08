import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import teamService from '@/services/teams';
import { ITeam, ISubscription, ITeamMember } from '@/interfaces/ITeam';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TeamDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<ITeam | null>(null);
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const teams = await teamService.listTeams();
      if (teams.length > 0) {
        const teamData = await teamService.getTeam(teams[0].id);
        setTeam(teamData);
        
        const subData = await teamService.getSubscription(teams[0].id);
        setSubscription(subData);
      }
    } catch (err: any) {
      setError('Erro ao carregar dados do time');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      owner: 'Proprietário',
      admin: 'Administrador',
      lawyer: 'Advogado',
      paralegal: 'Paralegal',
      secretary: 'Secretário',
      intern: 'Estagiário',
    };
    return labels[role] || role;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
      active: 'success',
      invited: 'warning',
      inactive: 'error',
      trial: 'warning',
      cancelled: 'error',
      expired: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!team) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Nenhum time encontrado
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/team-setup')}
          sx={{ mt: 2 }}
        >
          Criar Time
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Dashboard do Time
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <GroupsIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Membros do Time
                </Typography>
              </Box>
              <Typography variant="h4">
                {team.members?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                de {subscription?.subscription_plan?.max_users || '∞'} permitidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <BusinessIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Escritórios
                </Typography>
              </Box>
              <Typography variant="h4">
                {team.offices?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                de {subscription?.subscription_plan?.max_offices || '∞'} permitidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PaymentIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Plano Atual
                </Typography>
              </Box>
              <Typography variant="h6">
                {subscription?.subscription_plan?.name || 'Sem plano'}
              </Typography>
              <Chip
                label={subscription?.status || 'Inativo'}
                color={getStatusColor(subscription?.status || '')}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Uso de Casos
                </Typography>
              </Box>
              <Typography variant="h4">
                {subscription?.usage?.cases?.used || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                de {subscription?.subscription_plan?.max_cases || '∞'} permitidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Informações do Time" />
          <Tab label="Membros" />
          <Tab label="Escritórios" />
          <Tab label="Assinatura" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {team.name}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {team.description || 'Sem descrição'}
            </Typography>
            <Box mt={2}>
              <Button variant="outlined" startIcon={<EditIcon />}>
                Editar Informações
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Membros do Time</Typography>
              <Button variant="contained" startIcon={<PersonAddIcon />}>
                Convidar Membro
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Função</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {team.members?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip label={getRoleLabel(member.role)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        color={getStatusColor(member.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Escritórios</Typography>
              <Button variant="contained" startIcon={<BusinessIcon />}>
                Adicionar Escritório
              </Button>
            </Box>
            <Grid container spacing={2}>
              {team.offices?.map((office) => (
                <Grid item xs={12} md={6} key={office.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        {office.name}
                        {office.is_main && (
                          <Chip label="Principal" size="small" color="primary" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {office.address}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {office.city}, {office.state} - {office.zip_code}
                      </Typography>
                      <Box mt={1}>
                        <Typography variant="body2">
                          📞 {office.phone}
                        </Typography>
                        <Typography variant="body2">
                          ✉️ {office.email}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detalhes da Assinatura
            </Typography>
            {subscription ? (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Plano
                    </Typography>
                    <Typography variant="h6">
                      {subscription.subscription_plan.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      label={subscription.status}
                      color={getStatusColor(subscription.status)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Valor Mensal
                    </Typography>
                    <Typography variant="h6">
                      R$ {subscription.monthly_amount}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Período
                    </Typography>
                    <Typography variant="body1">
                      {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
                      {subscription.end_date && ` - ${new Date(subscription.end_date).toLocaleDateString('pt-BR')}`}
                    </Typography>
                  </Grid>
                </Grid>

                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Uso do Plano
                  </Typography>
                  {subscription.usage && (
                    <Box>
                      <Box mb={2}>
                        <Typography variant="body2">
                          Usuários: {subscription.usage.users.used} / {subscription.usage.users.limit}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={subscription.usage.users.percentage}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2">
                          Escritórios: {subscription.usage.offices.used} / {subscription.usage.offices.limit}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={subscription.usage.offices.percentage}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2">
                          Casos: {subscription.usage.cases.used} / {subscription.usage.cases.limit}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={subscription.usage.cases.percentage}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box mt={3}>
                  <Button variant="outlined" sx={{ mr: 2 }}>
                    Alterar Plano
                  </Button>
                  <Button variant="outlined" color="error">
                    Cancelar Assinatura
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" color="textSecondary">
                  Nenhuma assinatura ativa
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Escolher Plano
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TeamDashboard;