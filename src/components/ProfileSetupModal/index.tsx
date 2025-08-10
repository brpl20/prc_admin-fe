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
  Checkbox,
  FormControlLabel,
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
  // Endereço obrigatório
  street: z.string().min(1, { message: 'Rua é obrigatória' }),
  number: z.string().min(1, { message: 'Número é obrigatório' }),
  neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatória' }),
  state: z.string().min(2, { message: 'Estado é obrigatório' }),
  zipCode: z.string().min(8, { message: 'CEP é obrigatório' }),
  // Opção de cadastrar escritório
  createOffice: z.boolean().default(false),
  // Campos do escritório (opcionais, mas obrigatórios quando createOffice é true)
  officeName: z.string().optional(),
  officeCnpj: z.string().optional(),
  officeOab: z.string().optional(),
  officeStreet: z.string().optional(),
  officeNumber: z.string().optional(),
  officeNeighborhood: z.string().optional(),
  officeCity: z.string().optional(),
  officeState: z.string().optional(),
  officeZipCode: z.string().optional(),
});

type ProfileSetupForm = z.infer<typeof ProfileSetupSchema>;

interface ProfileSetupModalProps {
  open: boolean;
  onComplete: () => void;
  oab?: string;
}

// Função para buscar endereço pelo CEP usando ViaCEP
const fetchAddressByCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ open, onComplete, oab }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tempOab, setTempOab] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingOfficeCep, setLoadingOfficeCep] = useState(false);

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
      createOffice: false,
    },
  });


  const watchRole = watch('role');
  const watchGender = watch('gender');
  const watchCivilStatus = watch('civilStatus');
  const watchNationality = watch('nationality');
  const watchCreateOffice = watch('createOffice');
  const watchZipCode = watch('zipCode');
  const watchOfficeZipCode = watch('officeZipCode');

  // Auto-fill address when CEP changes - with debounce to prevent flickering
  React.useEffect(() => {
    if (!watchZipCode || watchZipCode.length < 8) {
      setLoadingCep(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoadingCep(true);
      try {
        const address = await fetchAddressByCep(watchZipCode);
        if (address) {
          setValue('street', address.street, { shouldValidate: false });
          setValue('neighborhood', address.neighborhood, { shouldValidate: false });
          setValue('city', address.city, { shouldValidate: false });
          setValue('state', address.state, { shouldValidate: false });
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setLoadingCep(false);
      }
    }, 500); // 500ms debounce to prevent too many requests

    return () => clearTimeout(timeoutId);
  }, [watchZipCode, setValue]);

  // Auto-fill office address when Office CEP changes - with debounce
  React.useEffect(() => {
    if (!watchOfficeZipCode || watchOfficeZipCode.length < 8) {
      setLoadingOfficeCep(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoadingOfficeCep(true);
      try {
        const address = await fetchAddressByCep(watchOfficeZipCode);
        if (address) {
          setValue('officeStreet', address.street, { shouldValidate: false });
          setValue('officeNeighborhood', address.neighborhood, { shouldValidate: false });
          setValue('officeCity', address.city, { shouldValidate: false });
          setValue('officeState', address.state, { shouldValidate: false });
        }
      } catch (error) {
        console.error('Error fetching office address:', error);
      } finally {
        setLoadingOfficeCep(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [watchOfficeZipCode, setValue]);

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
          addresses_attributes: [
            {
              street: data.street,
              number: data.number,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
              zip_code: data.zipCode,
              description: 'Endereço Principal'
            }
          ]
        }
      });

      // Se escolheu criar escritório, criar após o ProfileAdmin
      if (data.createOffice && data.officeName) {
        try {
          // Obter o ProfileAdmin criado para usar como responsible_lawyer_id
          const profileAdminId = response.data?.data?.id;
          
          await api.post('/offices', {
            office: {
              name: data.officeName,
              cnpj: data.officeCnpj,
              oab: data.officeOab,
              street: data.officeStreet,
              number: data.officeNumber,
              neighborhood: data.officeNeighborhood,
              city: data.officeCity,
              state: data.officeState,
              cep: data.officeZipCode,
              society: 'company',
              office_type_id: 1, // Advocacia
              responsible_lawyer_id: profileAdminId
            }
          });
        } catch (officeError) {
          console.error('Erro ao criar escritório:', officeError);
          // Não bloquear o fluxo se o escritório falhar
        }
      }

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
        keepMounted={false}
        onClose={(_event, reason) => {
          if (reason === 'backdropClick') return;
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '90vh',
            overflow: 'visible',
          }
        }}
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
          <DialogContent 
            sx={{ 
              maxHeight: '60vh', 
              overflowY: 'auto',
              paddingTop: 2,
              paddingBottom: 2
            }}
          >
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Dados Pessoais */}
              <Typography variant="subtitle1" fontWeight="bold">
                Dados Pessoais
              </Typography>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Nome *
                </Typography>
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
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Sobrenome *
                </Typography>
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
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  CPF *
                </Typography>
                <Input
                  isErrored={!!errors.cpf}
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  fullWidth
                />
                {errors.cpf && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.cpf.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  RG *
                </Typography>
                <Input
                  isErrored={!!errors.rg}
                  {...register('rg')}
                  placeholder="Digite seu RG"
                  fullWidth
                />
                {errors.rg && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.rg.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  OAB *
                </Typography>
                <Input
                  isErrored={!!errors.oab}
                  {...register('oab')}
                  placeholder="UF 000000"
                  fullWidth
                />
                {errors.oab && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.oab.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Função *
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Selecione sua função</InputLabel>
                  <Select
                    value={watchRole}
                    label="Selecione sua função"
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
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Gênero *
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Selecione seu gênero</InputLabel>
                  <Select
                    value={watchGender}
                    label="Selecione seu gênero"
                  onChange={(e) => setValue('gender', e.target.value as any)}
                >
                  <MenuItem value="male">Masculino</MenuItem>
                  <MenuItem value="female">Feminino</MenuItem>
                  <MenuItem value="other">Outro</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Estado Civil *
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Selecione seu estado civil</InputLabel>
                  <Select
                    value={watchCivilStatus}
                    label="Selecione seu estado civil"
                  onChange={(e) => setValue('civilStatus', e.target.value as any)}
                >
                  <MenuItem value="single">Solteiro</MenuItem>
                  <MenuItem value="married">Casado</MenuItem>
                  <MenuItem value="divorced">Divorciado</MenuItem>
                  <MenuItem value="widower">Viúvo</MenuItem>
                  <MenuItem value="union">União Estável</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Nacionalidade *
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Selecione sua nacionalidade</InputLabel>
                  <Select
                    value={watchNationality}
                    label="Selecione sua nacionalidade"
                  onChange={(e) => setValue('nationality', e.target.value as any)}
                >
                  <MenuItem value="brazilian">Brasileiro</MenuItem>
                  <MenuItem value="foreigner">Estrangeiro</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Seção de Endereço */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Endereço Profissional
              </Typography>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  CEP * {loadingCep && '(Buscando endereço...)'}
                </Typography>
                <Input
                  isErrored={!!errors.zipCode}
                  {...register('zipCode')}
                  placeholder="00000-000"
                  fullWidth
                />
                {errors.zipCode && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.zipCode.message}
                  </Typography>
                )}
              </Box>

              <Box display="flex" gap={2}>
                <Box flex={3}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Rua/Avenida *
                  </Typography>
                  <Input
                    isErrored={!!errors.street}
                    {...register('street')}
                    placeholder="Rua/Avenida"
                    fullWidth
                  />
                  {errors.street && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.street.message}
                    </Typography>
                  )}
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Número *
                  </Typography>
                  <Input
                    isErrored={!!errors.number}
                    {...register('number')}
                    placeholder="Número"
                    fullWidth
                  />
                  {errors.number && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.number.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Bairro *
                </Typography>
                <Input
                  isErrored={!!errors.neighborhood}
                  {...register('neighborhood')}
                  placeholder="Bairro"
                  fullWidth
                />
                {errors.neighborhood && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.neighborhood.message}
                  </Typography>
                )}
              </Box>

              <Box display="flex" gap={2}>
                <Box flex={2}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Cidade *
                  </Typography>
                  <Input
                    isErrored={!!errors.city}
                    {...register('city')}
                    placeholder="Cidade"
                    fullWidth
                  />
                  {errors.city && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.city.message}
                    </Typography>
                  )}
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Estado (UF) *
                  </Typography>
                  <Input
                    isErrored={!!errors.state}
                    {...register('state')}
                    placeholder="SP"
                    fullWidth
                  />
                  {errors.state && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.state.message}
                    </Typography>
                  )}
                </Box>
              </Box>


              {/* Opção de Criar Escritório */}
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watchCreateOffice}
                      onChange={(e) => setValue('createOffice', e.target.checked)}
                    />
                  }
                  label="Deseja cadastrar seu Escritório (PJ) também?"
                />
              </Box>

              {/* Campos do Escritório - mostrados apenas se checkbox marcado */}
              {watchCreateOffice && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    Dados do Escritório (Pessoa Jurídica)
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Nome do Escritório *
                    </Typography>
                    <Input
                      {...register('officeName')}
                      placeholder="Razão Social"
                      fullWidth
                    />
                  </Box>

                  <Box display="flex" gap={2} sx={{ mt: 2 }}>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        CNPJ *
                      </Typography>
                      <Input
                        {...register('officeCnpj')}
                        placeholder="00.000.000/0000-00"
                        fullWidth
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        OAB do Escritório
                      </Typography>
                      <Input
                        {...register('officeOab')}
                        placeholder="OAB/UF 000000"
                        fullWidth
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      CEP do Escritório * {loadingOfficeCep && '(Buscando endereço...)'}
                    </Typography>
                    <Input
                      {...register('officeZipCode')}
                      placeholder="00000-000"
                      fullWidth
                    />
                  </Box>

                  <Box display="flex" gap={2} sx={{ mt: 2 }}>
                    <Box flex={3}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        Rua/Avenida *
                      </Typography>
                      <Input
                        {...register('officeStreet')}
                        placeholder="Rua/Avenida"
                        fullWidth
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        Número *
                      </Typography>
                      <Input
                        {...register('officeNumber')}
                        placeholder="000"
                        fullWidth
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Bairro *
                    </Typography>
                    <Input
                      {...register('officeNeighborhood')}
                      placeholder="Bairro"
                      fullWidth
                    />
                  </Box>

                  <Box display="flex" gap={2} sx={{ mt: 2 }}>
                    <Box flex={2}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        Cidade *
                      </Typography>
                      <Input
                        {...register('officeCity')}
                        placeholder="Cidade"
                        fullWidth
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        Estado (UF) *
                      </Typography>
                      <Input
                        {...register('officeState')}
                        placeholder="SP"
                        fullWidth
                      />
                    </Box>
                  </Box>

                </Box>
              )}
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
