import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Delete, PersonAdd, Edit } from '@mui/icons-material';
import { colors } from '@/styles/globals';
import { useTeam } from '@/contexts/TeamContext';
import {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  updateTeam,
} from '@/services/teams';
import { Notification } from '@/components';

interface TeamManagementModalProps {
  open: boolean;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  status: string;
  joined_at: string;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ open, onClose }) => {
  const { currentTeam, teamRole } = useTeam();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (open && currentTeam) {
      fetchTeamMembers();
      setTeamName(currentTeam.name);
    }
  }, [open, currentTeam]);

  const fetchTeamMembers = async () => {
    if (!currentTeam) return;
    
    setLoading(true);
    try {
      const response = await getTeamMembers(currentTeam.id);
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setNotification({
        open: true,
        message: 'Erro ao carregar membros da equipe',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!currentTeam || !inviteEmail) return;

    setLoading(true);
    try {
      await addTeamMember(currentTeam.id, { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setInviteRole('member');
      fetchTeamMembers();
      setNotification({
        open: true,
        message: 'Convite enviado com sucesso',
        severity: 'success',
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Erro ao enviar convite',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!currentTeam) return;

    setLoading(true);
    try {
      await updateTeamMember(currentTeam.id, memberId, newRole);
      fetchTeamMembers();
      setNotification({
        open: true,
        message: 'Função atualizada com sucesso',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erro ao atualizar função',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam) return;

    setLoading(true);
    try {
      await removeTeamMember(currentTeam.id, memberId);
      fetchTeamMembers();
      setNotification({
        open: true,
        message: 'Membro removido com sucesso',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erro ao remover membro',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeamName = async () => {
    if (!currentTeam || !teamName) return;

    setLoading(true);
    try {
      await updateTeam(currentTeam.id, { name: teamName });
      setEditingTeam(false);
      setNotification({
        open: true,
        message: 'Nome da equipe atualizado',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erro ao atualizar nome da equipe',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const canManageTeam = teamRole === 'owner' || teamRole === 'admin';
  const canManageMembers = teamRole === 'owner';

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingTeam && canManageTeam ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  size="small"
                  disabled={loading}
                />
                <Button onClick={handleUpdateTeamName} disabled={loading} size="small">
                  Salvar
                </Button>
                <Button onClick={() => setEditingTeam(false)} size="small">
                  Cancelar
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">{currentTeam?.name}</Typography>
                {canManageTeam && (
                  <IconButton onClick={() => setEditingTeam(true)} size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {currentTeam?.subdomain}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {canManageMembers && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Convidar Novo Membro
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  size="small"
                  disabled={loading}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Função</InputLabel>
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    label="Função"
                    disabled={loading}
                  >
                    <MenuItem value="member">Membro</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleInviteMember}
                  disabled={loading || !inviteEmail}
                  sx={{ color: colors.white }}
                >
                  Convidar
                </Button>
              </Box>
            </Box>
          )}

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Membros da Equipe
          </Typography>

          {loading && members.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Função</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Membro desde</TableCell>
                    {canManageMembers && <TableCell align="right">Ações</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {canManageMembers && member.role !== 'owner' ? (
                          <Select
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                            size="small"
                            disabled={loading}
                          >
                            <MenuItem value="member">Membro</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        ) : (
                          <Chip
                            label={
                              member.role === 'owner'
                                ? 'Proprietário'
                                : member.role === 'admin'
                                ? 'Admin'
                                : 'Membro'
                            }
                            size="small"
                            color={member.role === 'owner' ? 'primary' : 'default'}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.status === 'active' ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={member.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      {canManageMembers && (
                        <TableCell align="right">
                          {member.role !== 'owner' && (
                            <IconButton
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={loading}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </>
  );
};

export default TeamManagementModal;