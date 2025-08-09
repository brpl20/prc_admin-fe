import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuItem,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useTeam } from '@/contexts/TeamContext';
import { colors } from '@/styles/globals';
import { createTeam } from '@/services/teams';
import { Notification } from '@/components';

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ open, onClose, onTeamCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName || !subdomain) {
      setError('Por favor, preencha todos os campos');
      setShowNotification(true);
      return;
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      setError('Subdomínio inválido. Use apenas letras minúsculas, números e hífens');
      setShowNotification(true);
      return;
    }

    setLoading(true);
    try {
      await createTeam({ name: teamName, subdomain });
      onTeamCreated();
      onClose();
      setTeamName('');
      setSubdomain('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao criar equipe');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Nova Equipe</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome da Equipe"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              margin="normal"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Subdomínio"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              margin="normal"
              helperText="Será usado como identificador único da equipe"
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateTeam}
            variant="contained"
            disabled={loading}
            sx={{ color: colors.white }}
          >
            {loading ? <CircularProgress size={20} /> : 'Criar Equipe'}
          </Button>
        </DialogActions>
      </Dialog>
      {showNotification && (
        <Notification
          open={showNotification}
          message={error}
          severity="error"
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

const TeamSelector: React.FC = () => {
  const { currentTeam, teams, switchToTeam, teamRole, isLoading, refreshTeams } = useTeam();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [switching, setSwitching] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTeamSwitch = async (teamId: number) => {
    setSwitching(true);
    try {
      await switchToTeam(teamId);
      handleClose();
    } catch (error) {
      console.error('Error switching team:', error);
    } finally {
      setSwitching(false);
    }
  };

  const handleCreateTeam = () => {
    handleClose();
    setCreateDialogOpen(true);
  };

  const handleTeamCreated = async () => {
    await refreshTeams();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={handleClick}
          endIcon={<KeyboardArrowDown />}
          sx={{
            textTransform: 'none',
            color: colors.text,
            backgroundColor: colors.backgroundLight,
            px: 2,
            py: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: colors.backgroundMedium,
            },
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentTeam?.name || 'Selecione uma equipe'}
            </Typography>
            {teamRole && (
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {teamRole === 'owner' ? 'Proprietário' : teamRole === 'admin' ? 'Administrador' : 'Membro'}
              </Typography>
            )}
          </Box>
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 250,
              maxHeight: 400,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ color: colors.textSecondary }}>
              Suas Equipes
            </Typography>
          </Box>
          <Divider />
          
          {teams.length === 0 ? (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Você não está em nenhuma equipe
              </Typography>
            </Box>
          ) : (
            teams.map((team) => (
              <MenuItem
                key={team.id}
                onClick={() => handleTeamSwitch(team.id)}
                selected={currentTeam?.id === team.id}
                disabled={switching}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2">{team.name}</Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    {team.subdomain}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          
          <Divider />
          <MenuItem onClick={handleCreateTeam}>
            <Typography variant="body2" sx={{ color: colors.primary }}>
              Criar Nova Equipe
            </Typography>
          </MenuItem>
        </Menu>
      </Box>

      <CreateTeamDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </>
  );
};

export default TeamSelector;