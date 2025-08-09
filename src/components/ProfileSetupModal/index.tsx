import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Backdrop,
} from '@mui/material';
import { Input, Button } from '@/styles/login';
import api from '@/services/api';
import { Notification } from '@/components';

const ProfileSetupSchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' }),
  lastName: z.string().min(2, { message: 'Sobrenome é obrigatório' }),
  cpf: z.string().min(11, { message: 'CPF é obrigatório' }),
  rg: z.string().min(1, { message: 'RG é obrigatório' }),
  oab: z.string().min(1, { message: 'OAB é obrigatório' }),
  role: z.enum(['lawyer', 'paralegal', 'trainee', 'secretary', 'counter', 'excounter', 'representant']),
  gender: z.enum(['male', 'female', 'other']),
  civilStatus: z.enum(['single', 'married', 'divorced', 'widower', 'union']),
  nationality: z.enum(['brazilian', 'foreigner']),
});

type ProfileSetupForm = z.infer<typeof ProfileSetupSchema>;

interface ProfileSetupModalProps {
  open: boolean;
  onComplete: () => void;
  oab?: string;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ open, onComplete, oab }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tempOab, setTempOab] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProfileSetupForm>({
    resolver: zodResolver(ProfileSetupSchema),
    defaultValues: {
      role: 'lawyer',
      gender: 'male',
      civilStatus: 'single',
      nationality: 'brazilian',
    },
  });


  const watchRole = watch('role');
  const watchGender = watch('gender');
  const watchCivilStatus = watch('civilStatus');
  const watchNationality = watch('nationality');

  async function handleProfileSetup(data: ProfileSetupForm) {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/profile_admins', {
        profile_admin: {
          name: data.name,
          last_name: data.lastName,
          cpf: data.cpf,
          rg: data.rg,
          oab: data.oab,
          role: data.role,
          gender: data.gender,
          civil_status: data.civilStatus,
          nationality: data.nationality,
        }
      });

      if (response.status === 201 || response.status === 200) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Profile setup error:', error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0 && typeof errors[0] === 'object') {
          const errorMessages = errors[0].code || errors;
          setErrorMessage(Array.isArray(errorMessages) ? errorMessages.join(', ') : errorMessages);
        } else {
          setErrorMessage(errors);
        }
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erro ao configurar perfil. Por favor, tente novamente.');
      }
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        disableBackdropClick
        BackdropComponent={(props) => (
          <Backdrop
            {...props}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      >
        <DialogTitle>
          <Typography variant="h5" component="h2" textAlign="center">
            Complete seu Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Precisamos de algumas informações para finalizar sua conta
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit(handleProfileSetup)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Input
                  isErrored={!!errors.name}
                  {...register('name')}
                  placeholder="Nome"
                  fullWidth
                />
                {errors.name && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.name.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Input
                  isErrored={!!errors.lastName}
                  {...register('lastName')}
                  placeholder="Sobrenome"
                  fullWidth
                />
                {errors.lastName && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.lastName.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Input
                  isErrored={!!errors.cpf}
                  {...register('cpf')}
                  placeholder="CPF"
                  fullWidth
                />
                {errors.cpf && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.cpf.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Input
                  isErrored={!!errors.rg}
                  {...register('rg')}
                  placeholder="RG"
                  fullWidth
                />
                {errors.rg && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.rg.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Input
                  isErrored={!!errors.oab}
                  {...register('oab')}
                  placeholder="Digite sua OAB UF_00000"
                  fullWidth
                />
                {errors.oab && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.oab.message}
                  </Typography>
                )}
              </Box>

              <FormControl fullWidth>
                <InputLabel>Função</InputLabel>
                <Select
                  value={watchRole}
                  label="Função"
                  onChange={(e) => setValue('role', e.target.value as any)}
                >
                  <MenuItem value="lawyer">Advogado</MenuItem>
                  <MenuItem value="paralegal">Paralegal</MenuItem>
                  <MenuItem value="trainee">Estagiário</MenuItem>
                  <MenuItem value="secretary">Secretário</MenuItem>
                  <MenuItem value="counter">Contador</MenuItem>
                  <MenuItem value="excounter">Ex-contador</MenuItem>
                  <MenuItem value="representant">Representante</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Gênero</InputLabel>
                <Select
                  value={watchGender}
                  label="Gênero"
                  onChange={(e) => setValue('gender', e.target.value as any)}
                >
                  <MenuItem value="male">Masculino</MenuItem>
                  <MenuItem value="female">Feminino</MenuItem>
                  <MenuItem value="other">Outro</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Estado Civil</InputLabel>
                <Select
                  value={watchCivilStatus}
                  label="Estado Civil"
                  onChange={(e) => setValue('civilStatus', e.target.value as any)}
                >
                  <MenuItem value="single">Solteiro</MenuItem>
                  <MenuItem value="married">Casado</MenuItem>
                  <MenuItem value="divorced">Divorciado</MenuItem>
                  <MenuItem value="widower">Viúvo</MenuItem>
                  <MenuItem value="union">União Estável</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Nacionalidade</InputLabel>
                <Select
                  value={watchNationality}
                  label="Nacionalidade"
                  onChange={(e) => setValue('nationality', e.target.value as any)}
                >
                  <MenuItem value="brazilian">Brasileiro</MenuItem>
                  <MenuItem value="foreigner">Estrangeiro</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
              fullWidth
              style={{
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Configurando...' : 'Finalizar Configuração'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Notification
        open={openSnackbar}
        message={errorMessage}
        severity="error"
        onClose={() => setOpenSnackbar(false)}
      />
    </>
  );
};

export default ProfileSetupModal;