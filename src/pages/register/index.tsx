import { z } from 'zod';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../assets/logo-colors@3x.png';
import { Box, Link, Typography } from '@mui/material';
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
  email: z.string().min(3, { message: 'Email é obrigatório' }).email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type UserDataForm = z.infer<typeof UserSchema>;

const Register = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserDataForm>({
    resolver: zodResolver(UserSchema),
  });

  async function handleRegister(data: UserDataForm) {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Use the registration endpoint that handles admin and team creation
      const response = await serverApi.post('/register', {
        registration: {
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword,
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
          // Don't manually redirect - let NextAuth handle it (will go to /team-check)
          router.push('/team-check');
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

        <Typography sx={{ marginBottom: '24px', fontSize: '28px' }}>
          {'Crie sua conta'}
        </Typography>

        <Form onSubmit={handleSubmit(handleRegister)}>
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

          <Box display={'flex'} justifyContent={'center'} sx={{ marginTop: '24px' }}>
            <Button
              isLoading={loading}
              type="submit"
              style={{ cursor: 'pointer' }}
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
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