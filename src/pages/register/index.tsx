import { z } from 'zod';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../assets/logo-colors@3x.png';
import { Box, Link, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { Notification } from '@/components';
import {
  Container,
  Content,
  Input,
  Form,
  Button,
} from '@/styles/login';
import { colors } from '@/styles/globals';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { serverApi } from '@/services/api';

const UserSchema = z.object({
  // Step 1 - User Info
  name: z.string().min(2, { message: 'Nome é obrigatório' }),
  lastName: z.string().min(2, { message: 'Sobrenome é obrigatório' }),
  email: z.string().min(3, { message: 'Email é obrigatório' }).email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
  confirmPassword: z.string(),
  // Step 2 - Team Info
  teamName: z.string().min(2, { message: 'Nome da equipe é obrigatório' }),
  teamSubdomain: z.string()
    .min(3, { message: 'Subdomínio deve ter no mínimo 3 caracteres' })
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, { message: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífens' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type UserDataForm = z.infer<typeof UserSchema>;

const steps = ['Informações Pessoais', 'Criar Equipe'];

const Register = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<UserDataForm>({
    resolver: zodResolver(UserSchema),
  });

  const handleNext = async () => {
    const fieldsToValidate = activeStep === 0 
      ? ['name', 'lastName', 'email', 'password', 'confirmPassword'] as const
      : ['teamName', 'teamSubdomain'] as const;
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  async function handleRegister(data: UserDataForm) {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Step 1: Create profile admin with team
      const response = await serverApi.post('/profile_admins', {
        name: data.name.trim(),
        last_name: data.lastName.trim(),
        status: 'active',
        role: 'lawyer',
        admin_attributes: {
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword,
        },
        team_attributes: {
          name: data.teamName,
          subdomain: data.teamSubdomain.toLowerCase(),
        }
      });

      if (response.status === 201) {
        setSuccessMessage('Conta criada com sucesso! Fazendo login...');
        setOpenSnackbar(true);

        // Auto login after registration
        const loginResponse = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (loginResponse?.status === 200) {
          router.push('/clientes');
        } else {
          router.push('/login');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          setErrorMessage(errors.join(', '));
        } else if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join(', ');
          setErrorMessage(errorMessages);
        } else {
          setErrorMessage(errors);
        }
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erro ao criar conta. Por favor, tente novamente.');
      }
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Head>
        <title>{'Cadastro - ProcStudio'}</title>
      </Head>

      <Content>
        <Box className="imageContainer">
          <Image priority width={200} height={150} src={Logo} alt="Logo" />
        </Box>

        <Typography sx={{ marginBottom: '16px', fontSize: '28px' }}>
          {'Crie sua conta'}
        </Typography>

        <Box sx={{ width: '100%', mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Form onSubmit={handleSubmit(handleRegister)}>
          {activeStep === 0 && (
            <>
              <Box mb={2}>
                <Input
                  isErrored={!!errors.name}
                  {...register('name')}
                  name="name"
                  type="text"
                  placeholder="Nome"
                />
                {errors.name && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.name.message}
                  </Typography>
                )}
              </Box>

              <Box mb={2}>
                <Input
                  isErrored={!!errors.lastName}
                  {...register('lastName')}
                  name="lastName"
                  type="text"
                  placeholder="Sobrenome"
                />
                {errors.lastName && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.lastName.message}
                  </Typography>
                )}
              </Box>

              <Box mb={2}>
                <Input
                  isErrored={!!errors.email}
                  {...register('email')}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                />
                {errors.email && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.email.message}
                  </Typography>
                )}
              </Box>

              <Box mb={2}>
                <Input
                  isErrored={!!errors.password}
                  {...register('password')}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Senha"
                />
                {errors.password && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.password.message}
                  </Typography>
                )}
              </Box>

              <Box mb={2}>
                <Input
                  isErrored={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirmar Senha"
                />
                {errors.confirmPassword && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.confirmPassword.message}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {activeStep === 1 && (
            <>
              <Box mb={2}>
                <Input
                  isErrored={!!errors.teamName}
                  {...register('teamName')}
                  name="teamName"
                  type="text"
                  placeholder="Nome da Equipe/Escritório"
                />
                {errors.teamName && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.teamName.message}
                  </Typography>
                )}
              </Box>

              <Box mb={2}>
                <Input
                  isErrored={!!errors.teamSubdomain}
                  {...register('teamSubdomain')}
                  name="teamSubdomain"
                  type="text"
                  placeholder="Subdomínio (ex: meuescritorio)"
                />
                {errors.teamSubdomain && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {errors.teamSubdomain.message}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ ml: 1, color: colors.textSecondary }}>
                  Será usado como identificador único da sua equipe
                </Typography>
              </Box>
            </>
          )}

          <Box display={'flex'} justifyContent={'center'} sx={{ marginTop: '24px', gap: 2 }}>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outlined"
                style={{ cursor: 'pointer' }}
              >
                Voltar
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                type="button"
                style={{ cursor: 'pointer' }}
              >
                Próximo
              </Button>
            ) : (
              <Button
                isLoading={loading}
                type="submit"
                style={{ cursor: 'pointer' }}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            )}
          </Box>

          <Box display={'flex'} justifyContent={'center'} textAlign={'center'} gap={1} mt={2}>
            <Typography variant="subtitle1">{'Já tem uma conta?'}</Typography>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="subtitle1" fontWeight={'bold'} color="primary" style={{ cursor: 'pointer' }}>
                {'Fazer login'}
              </Typography>
            </Link>
          </Box>
        </Form>
      </Content>

      <Notification
        open={openSnackbar && !!errorMessage}
        message={errorMessage}
        severity="error"
        onClose={() => setOpenSnackbar(false)}
      />

      <Notification
        open={openSnackbar && !!successMessage}
        message={successMessage}
        severity="success"
        onClose={() => setOpenSnackbar(false)}
      />
    </Container>
  );
};

export default Register;