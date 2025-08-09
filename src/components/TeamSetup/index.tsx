import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Container,
  Grid,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
import teamService from '@/services/teams';
import { ICreateTeamData } from '@/interfaces/ITeam';

const steps = ['Criar Time', 'Adicionar Membros', 'Configurar Escritórios'];

const TeamSetup: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);

  const [teamData, setTeamData] = useState<ICreateTeamData>({
    name: '',
    description: '',
  });

  const [members, setMembers] = useState<Array<{ email: string; role: string }>>([]);
  const [offices, setOffices] = useState<Array<{ name: string; address: string }>>([]);

  const handleCreateTeam = async () => {
    if (!teamData.name) {
      setError('Nome do time é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const team = await teamService.createTeam(teamData);
      setTeamId(team.id);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar time');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (!teamId) return;

    setLoading(true);
    setError('');

    try {
      for (const member of members) {
        if (member.email) {
          await teamService.addTeamMember(teamId, {
            email: member.email,
            role: member.role as any,
          });
        }
      }
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar membros');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    router.push('/home');
  };

  const handleSkip = () => {
    if (activeStep === 0) {
      return;
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else {
      handleFinish();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Criar seu Time
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Configure as informações básicas do seu time jurídico
            </Typography>
            <Box mt={3}>
              <TextField
                fullWidth
                label="Nome do Time"
                value={teamData.name}
                onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                margin="normal"
                required
                placeholder="Ex: Escritório Silva & Associados"
              />
              <TextField
                fullWidth
                label="Descrição"
                value={teamData.description}
                onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
                placeholder="Descreva brevemente seu escritório ou equipe jurídica"
              />
            </Box>
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button variant="outlined" disabled>
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateTeam}
                disabled={loading || !teamData.name}
              >
                {loading ? 'Criando...' : 'Criar Time'}
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Convidar Membros do Time
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Adicione advogados, paralegais e outros membros da equipe
            </Typography>
            <Box mt={3}>
              {[0, 1, 2].map((index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={members[index]?.email || ''}
                      onChange={(e) => {
                        const newMembers = [...members];
                        if (!newMembers[index]) {
                          newMembers[index] = { email: '', role: 'lawyer' };
                        }
                        newMembers[index].email = e.target.value;
                        setMembers(newMembers);
                      }}
                      placeholder="email@exemplo.com"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      select
                      fullWidth
                      label="Função"
                      value={members[index]?.role || 'lawyer'}
                      onChange={(e) => {
                        const newMembers = [...members];
                        if (!newMembers[index]) {
                          newMembers[index] = { email: '', role: 'lawyer' };
                        }
                        newMembers[index].role = e.target.value;
                        setMembers(newMembers);
                      }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="lawyer">Advogado</option>
                      <option value="paralegal">Paralegal</option>
                      <option value="secretary">Secretário</option>
                      <option value="intern">Estagiário</option>
                      <option value="admin">Administrador</option>
                    </TextField>
                  </Grid>
                </Grid>
              ))}
            </Box>
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={() => setActiveStep(0)}>
                Voltar
              </Button>
              <Box>
                <Button variant="text" onClick={handleSkip} sx={{ mr: 2 }}>
                  Pular
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddMembers}
                  disabled={loading}
                >
                  {loading ? 'Convidando...' : 'Enviar Convites'}
                </Button>
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Configurar Escritórios
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Adicione os endereços dos seus escritórios
            </Typography>
            <Box mt={3}>
              {[0, 1].map((index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Nome do Escritório"
                    value={offices[index]?.name || ''}
                    onChange={(e) => {
                      const newOffices = [...offices];
                      if (!newOffices[index]) {
                        newOffices[index] = { name: '', address: '' };
                      }
                      newOffices[index].name = e.target.value;
                      setOffices(newOffices);
                    }}
                    margin="normal"
                    placeholder="Ex: Sede Principal"
                  />
                  <TextField
                    fullWidth
                    label="Endereço"
                    value={offices[index]?.address || ''}
                    onChange={(e) => {
                      const newOffices = [...offices];
                      if (!newOffices[index]) {
                        newOffices[index] = { name: '', address: '' };
                      }
                      newOffices[index].address = e.target.value;
                      setOffices(newOffices);
                    }}
                    margin="normal"
                    placeholder="Rua, número, cidade, estado"
                  />
                </Box>
              ))}
            </Box>
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={() => setActiveStep(1)}>
                Voltar
              </Button>
              <Box>
                <Button variant="text" onClick={handleSkip} sx={{ mr: 2 }}>
                  Pular
                </Button>
                <Button
                  variant="contained"
                  onClick={handleFinish}
                  disabled={loading}
                >
                  Finalizar Configuração
                </Button>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </Paper>
    </Container>
  );
};

export default TeamSetup;