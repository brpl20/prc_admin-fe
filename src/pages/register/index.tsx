import { z } from 'zod';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../assets/logo-colors@3x.png';
import { Box, Link, Typography, Alert } from '@mui/material';
import { Notification } from '@/components';
import {
  Container,
  Content,
  Input,
  Form,
  Button,
} from '@/styles/login';
import { useRouter } from 'next/router';
import api from '@/services/api';

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Nome é obrigatório' }),
  lastName: z.string().min(2, { message: 'Sobrenome é obrigatório' }),
  email: z.string().min(3, { message: 'Email é obrigatório' }).email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
  passwordConfirmation: z.string().min(6, { message: 'Confirmação de senha é obrigatória' }),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas não coincidem",
  path: ["passwordConfirmation"],
});

type RegisterDataForm = z.infer<typeof RegisterSchema>;

const Register = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDataForm>({
    resolver: zodResolver(RegisterSchema),
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  async function handleRegister(data: RegisterDataForm) {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/api/v1/profile_admins', {
        profile_admin: {
          name: data.name,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
          password_confirmation: data.passwordConfirmation,
          role: 'admin',
        }
      });

      if (response.status === 201 || response.status === 200) {
        setSuccessMessage('Conta criada com sucesso! Redirecionando para o login...');
        setOpenSnackbar(true);
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
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

        <Typography sx={{ marginBottom: '24px', fontSize: '14px', color: 'text.secondary' }}>
          {'Preencha os dados abaixo para começar'}
        </Typography>

        <Form onSubmit={handleSubmit(handleRegister)}>
          <Box>
            <Box mb={2}>
              <Input
                isErrored={!!errors.name}
                {...register('name')}
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                placeholder="Nome"
              />
              {errors.name && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.name.message}
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <Input
                isErrored={!!errors.lastName}
                {...register('lastName')}
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Sobrenome"
              />
              {errors.lastName && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.lastName.message}
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <Input
                isErrored={!!errors.email}
                {...register('email')}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
              />
              {errors.email && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.email.message}
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <Input
                isErrored={!!errors.password}
                {...register('password')}
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Senha"
              />
              {errors.password && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.password.message}
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <Input
                isErrored={!!errors.passwordConfirmation}
                {...register('passwordConfirmation')}
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Confirmar Senha"
              />
              {errors.passwordConfirmation && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.passwordConfirmation.message}
                </Typography>
              )}
            </Box>
          </Box>

          <Box display={'flex'} justifyContent={'center'} sx={{ marginTop: '24px' }}>
            <Button
              isLoading={loading}
              type="submit"
              style={{
                cursor: 'pointer',
              }}
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