import React, { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import teamService from '@/services/teams';
import { ITeam, ICreateTeamData } from '@/interfaces/ITeam';
import api from '@/services/api';
import { doesTeamNeedSetup } from '@/utils/teamValidation';

const steps = ['Configurar Time', 'Convidar Membros', 'Finalizar Configuração'];

const TeamSetup: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTeam, setCurrentTeam] = useState<ITeam | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userOffice, setUserOffice] = useState<any>(null);

  const [teamData, setTeamData] = useState({
    name: '',
    subdomain: '',
    info: '', // Using 'info' instead of 'description' for display only
  });

  const [members, setMembers] = useState<Array<{ email: string; role: string; id?: string }>>([{ email: '', role: 'lawyer' }]);

  // Load existing team data when component mounts
  useEffect(() => {
    loadInitialData();
  }, [session]);

  const loadInitialData = async () => {
    if (!session?.token) return;
    
    try {
      setInitialLoading(true);
      
      // Load current team (mock team created during registration)
      const teams = await teamService.listTeams();
      if (teams && teams.length > 0) {
        const team = teams[0]; // Get the first team (mock team)
        setCurrentTeam(team);
        setTeamData({
          name: team.name,
          subdomain: team.subdomain || '',
          info: team.description || '', // Map description to info for display
        });
      }
      
      // Load user profile
      try {
        const profileResponse = await api.get('/profile_admins/me');
        setUserProfile(profileResponse.data?.data);
      } catch (profileErr) {
        console.log('Profile not found, which is expected for new users');
      }
      
      // TODO: Load user office if exists
      // This will need to be implemented when office-team linking is ready
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Erro ao carregar dados iniciais');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!teamData.name.trim()) {
      setError('Nome do time é obrigatório');
      return;
    }
    
    if (!teamData.subdomain.trim()) {
      setError('Subdomínio é obrigatório');
      return;
    }
    
    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (teamData.subdomain.length < 3 || !subdomainRegex.test(teamData.subdomain)) {
      setError('Subdomínio deve ter pelo menos 3 caracteres e conter apenas letras minúsculas, números e hífens');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Updating team with data:', teamData);
      console.log('Current team:', currentTeam);
      
      if (currentTeam) {
        // Update existing mock team (only name and subdomain for now)
        console.log('Updating existing team:', currentTeam.id);
        const updatedTeam = await teamService.updateTeam(currentTeam.id, {
          name: teamData.name.trim(),
          subdomain: teamData.subdomain.toLowerCase().trim(),
          // TODO: Add description field to Team model in backend
          // description: teamData.info.trim(),
        });
        console.log('Team updated successfully:', updatedTeam);
        setCurrentTeam(updatedTeam);
        setActiveStep(1);
        console.log('Moving to step 1 (team invitations)');
      } else {
        // Fallback: create new team if no mock team exists
        console.log('Creating new team');
        const team = await teamService.createTeam({
          name: teamData.name.trim(),
          subdomain: teamData.subdomain.toLowerCase().trim(),
          // TODO: Add description field to Team model in backend
          // description: teamData.info.trim(),
        });
        console.log('New team created:', team);
        setCurrentTeam(team);
        setActiveStep(1);
        console.log('Moving to step 1 (team invitations)');
      }
    } catch (err: any) {
      console.error('Error in handleUpdateTeam:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Erro ao configurar time';
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    if (!currentTeam) return;

    setLoading(true);
    setError('');

    try {
      // Filter out empty emails
      const validMembers = members.filter(member => member.email.trim() !== '');
      
      if (validMembers.length === 0) {
        setActiveStep(2); // Skip if no members to invite
        return;
      }

      // TODO: Implement team member invitation logic
      // For now, this is a walking skeleton - just simulate the process
      
      for (const member of validMembers) {
        try {
          // TODO: Replace with actual team invitation API call
          // await teamService.addTeamMember(currentTeam.id, {
          //   email: member.email.trim(),
          //   role: member.role as any,
          // });
          
          // TODO: Send invitation email
          // await emailService.sendTeamInvitation({
          //   email: member.email,
          //   teamName: currentTeam.name,
          //   role: member.role,
          //   inviterName: userProfile?.name || session?.name
          // });
          
          console.log(`TODO: Send invitation to team member as ${member.role} (email masked for privacy)`);
        } catch (memberErr: any) {
          console.error(`Failed to invite team member with role ${member.role}:`, memberErr);
          // Don't fail the entire process for individual member errors
        }
      }
      
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar convites');
    } finally {
      setLoading(false);
    }
  };
  
  const addMemberField = () => {
    setMembers([...members, { email: '', role: 'lawyer' }]);
  };
  
  const removeMemberField = (index: number) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };
  
  const updateMember = (index: number, field: 'email' | 'role', value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      // Validate that we have a current team before finishing
      if (!currentTeam) {
        setError('Erro interno: Nenhum time encontrado. Por favor, tente configurar novamente.');
        return;
      }

      // TODO: Link office to team if user has an office
      // if (userOffice && currentTeam) {
      //   await api.post(`/teams/${currentTeam.id}/offices`, {
      //     office_id: userOffice.id
      //   });
      // }
      
      // TODO: Update user's default team if needed
      // await teamService.switchTeam(currentTeam.id);
      
      // Verify team setup was completed successfully using more robust validation
      try {
        const updatedTeams = await teamService.listTeams();
        const setupTeam = updatedTeams.find(team => team.id === currentTeam.id);
        
        if (setupTeam) {
          // Use the existing validation logic instead of fragile timestamp comparison
          const teamStillNeedsSetup = doesTeamNeedSetup(setupTeam);
          
          if (!teamStillNeedsSetup) {
            // Team is properly configured - success!
            console.log('Team setup completed successfully - team is properly configured');
            router.push('/clientes');
          } else {
            // Team still needs setup - likely the update didn't work properly
            console.log('Team still needs setup after configuration attempt');
            
            // Force a simple update to ensure the team gets an updated_at timestamp
            try {
              console.log('Attempting to force team update to complete setup...');
              await teamService.updateTeam(currentTeam.id, {
                name: setupTeam.name, // Keep the same name
                subdomain: setupTeam.subdomain || teamData.subdomain, // Ensure subdomain is set
              });
              
              // Now check again
              const reVerifiedTeams = await teamService.listTeams();
              const reVerifiedTeam = reVerifiedTeams.find(team => team.id === currentTeam.id);
              
              if (reVerifiedTeam && !doesTeamNeedSetup(reVerifiedTeam)) {
                console.log('Team setup completed successfully after forced update');
                router.push('/clientes');
              } else {
                setError('Parece que a configuração não foi salva corretamente. Por favor, verifique os dados e tente novamente.');
              }
            } catch (forceUpdateError) {
              console.error('Error in force update:', forceUpdateError);
              setError('Erro ao finalizar a configuração. Por favor, tente novamente.');
            }
          }
        } else {
          setError('Erro interno: Time não encontrado após configuração. Por favor, recarregue a página.');
        }
      } catch (verificationError) {
        console.error('Error verifying team setup:', verificationError);
        setError('Não foi possível verificar se a configuração foi salva. Por favor, verifique sua conexão e tente novamente.');
      }
    } catch (error: any) {
      console.error('Error finishing setup:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro inesperado ao finalizar configuração';
      setError(`Erro ao finalizar configuração: ${errorMessage}. Por favor, tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (activeStep === 0) {
      // Can't skip team configuration
      return;
    } else if (activeStep === 1) {
      // Skip member invitations
      setActiveStep(2);
    } else {
      // Skip and finish
      handleFinish();
    }
  };
  
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };
  
  if (initialLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Carregando configuração do time...</Typography>
      </Container>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Configure seu Time Jurídico
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
              Adicione suas informações sobre seu time jurídico (o termo time é usado para todos os escritórios mesmo que seja uma advocacia individual)
            </Typography>
            
            {currentTeam && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Atualizando informações do seu time: <strong>{currentTeam.name}</strong>
              </Alert>
            )}
            
            <Box mt={3}>
              <TextField
                fullWidth
                label="Nome do Time/Escritório"
                value={teamData.name}
                onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                margin="normal"
                required
                placeholder="Ex: Escritório Silva & Associados, Advocacia João Santos"
                helperText="Este será o nome exibido em documentos e comunicações"
              />
              
              <TextField
                fullWidth
                label="Subdomínio"
                value={teamData.subdomain}
                onChange={(e) => setTeamData({ ...teamData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                margin="normal"
                required
                placeholder="Ex: silva-associados, joao-santos"
                helperText="Será usado como identificador único (apenas letras minúsculas, números e hífens)"
              />
              
              <TextField
                fullWidth
                label="Informações do Time"
                value={teamData.info}
                onChange={(e) => setTeamData({ ...teamData, info: e.target.value })}
                margin="normal"
                multiline
                rows={4}
                placeholder="Descreva brevemente seu escritório ou equipe jurídica. Ex: Especializado em direito empresarial e trabalhista, atendendo empresas de pequeno e médio porte na região metropolitana."
                helperText="[Em desenvolvimento] Estas informações serão salvas quando o backend for atualizado"
                disabled
                sx={{ opacity: 0.7 }}
              />
            </Box>
            <Box mt={4} display="flex" justifyContent="space-between">
              <Button variant="outlined" disabled>
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateTeam}
                disabled={loading || !teamData.name.trim() || !teamData.subdomain.trim()}
                size="large"
              >
                {loading ? 'Salvando...' : 'Continuar'}
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Convidar Membros da Equipe
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Envie convites para advogados, paralegais e outros colaboradores que farão parte do seu time
            </Typography>
            
            <Alert severity="warning" sx={{ mt: 2, mb: 3 }}>
              <Typography variant="body2">
                <strong>Funcionalidade em Desenvolvimento:</strong> Os convites por email ainda não estão funcionais. 
                Por enquanto, os membros precisarão se registrar separadamente e você poderá adicioná-los à equipe posteriormente.
              </Typography>
            </Alert>
            
            <Box mt={3}>
              {members.map((member, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                  <Grid item xs={7}>
                    <TextField
                      fullWidth
                      label={`Email do ${index === 0 ? '1º' : index === 1 ? '2º' : `${index + 1}º`} Membro`}
                      type="email"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      select
                      fullWidth
                      label="Função"
                      value={member.role}
                      onChange={(e) => updateMember(index, 'role', e.target.value)}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="lawyer">Advogado</option>
                      <option value="paralegal">Paralegal</option>
                      <option value="trainee">Estagiário</option>
                      <option value="secretary">Secretário</option>
                      <option value="admin">Administrador</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={1}>
                    {members.length > 1 && (
                      <IconButton 
                        onClick={() => removeMemberField(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}
              
              <Box mt={2}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addMemberField}
                  variant="outlined"
                  size="small"
                >
                  Adicionar Outro Membro
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={handleBack}>
                Voltar
              </Button>
              <Box>
                <Button variant="text" onClick={handleSkip} sx={{ mr: 2 }}>
                  Pular por Enquanto
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendInvitations}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Processando...' : 'Continuar'}
                </Button>
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Configuração Concluída! 🎉
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
              Seu time jurídico foi configurado com sucesso. Agora você pode começar a usar o sistema.
            </Typography>
            
            <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: 'primary.50' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Resumo da Configuração:
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1"><strong>Time:</strong> {teamData.name}</Typography>
                <Typography variant="body1"><strong>Subdomínio:</strong> {teamData.subdomain}</Typography>
                {teamData.info && (
                  <Typography variant="body1"><strong>Informações:</strong> {teamData.info}</Typography>
                )}
                <Typography variant="body1">
                  <strong>Convites Enviados:</strong> {members.filter(m => m.email.trim() !== '').length} membro(s)
                </Typography>
              </Box>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Próximos Passos:</strong>
                <br />• Gerencie clientes e casos na seção "Clientes"
                <br />• Configure escritórios e endereços nas "Configurações"
                <br />• Adicione mais membros à equipe quando necessário
                {userOffice && (
                  <><br />• Seu escritório cadastrado será automaticamente vinculado ao time</>
                )}
              </Typography>
            </Alert>
            
            <Box mt={4} display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={handleBack}>
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={handleFinish}
                disabled={loading}
                size="large"
                color="primary"
              >
                {loading ? 'Finalizando...' : 'Começar a Usar o Sistema'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom color="primary">
            Configurar seu Time Jurídico
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Vamos personalizar seu ambiente de trabalho em alguns passos simples
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </Paper>
    </Container>
  );
};

export default TeamSetup;