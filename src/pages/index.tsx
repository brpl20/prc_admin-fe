import { z } from 'zod';
import Head from 'next/head';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

import Image from 'next/image';
import Logo from '../assets/logo-colors@3x.png';
import Google from '../assets/google.svg';
import { Box, Link, Typography } from '@mui/material';

import { Notification } from '@/components';

import {
  Container,
  Content,
  Input,
  Form,
  Button,
  GoogleLoginButton,
  Divider,
} from '@/styles/login';
import { colors } from '@/styles/globals';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const UserSchema = z.object({
  email: z.string().min(3, { message: 'Email é obrigatório' }).email({ message: 'Email inválido' }),
  password: z.string().min(2, { message: 'Senha é obrigatória' }),
});

type UserDataForm = z.infer<typeof UserSchema>;

const Home = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserDataForm>({
    resolver: zodResolver(UserSchema),
  });
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  async function handleSignIn(data: any) {
    setLoading(true);

    try {
      const response = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (response?.status === 200) {
        router.push('/clientes');
      }

      if (response?.status === 401) {
        setErrorMessage('Usuário ou senha inválidos');
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      setErrorMessage('Erro ao fazer login');
      setOpenSnackbar(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Head>
        <title>{'Login'}</title>
      </Head>

      <Content>
        <Box className="imageContainer">
          <Image priority width={200} height={150} src={Logo} alt="Logo" />
        </Box>

        <Typography sx={{ marginBottom: '16px', fontSize: '28px' }}>{'Seja bem-vindo!'}</Typography>

        {/* <GoogleLoginButton onClick={() => signIn('google')}>
          <Image src={Google} alt="Logo" width={20} priority />
          <Typography color={colors.text} variant="subtitle1">
            {'Entrar com Google'}
          </Typography>
        </GoogleLoginButton> */}

        {/* <Box
          m={2}
          gap={2}
          width={'100%'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Divider />
          <Typography variant="subtitle1">{'ou'}</Typography>
          <Divider />
        </Box> */}
        <Form onSubmit={handleSubmit(handleSignIn)}>
          <Box>
            <Box mb={2}>
              <Input
                isErrored={!!errors.email}
                {...register('email')}
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
              />
            </Box>
            <Box>
              <Input
                isErrored={!!errors.password}
                {...register('password')}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
              />
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'flex-end'} textAlign={'center'}>
            <Link href="#">
              <Typography variant="subtitle2">{'Esqueceu sua senha?'}</Typography>
            </Link>
          </Box>
          <Box display={'flex'} justifyContent={'center'} sx={{ marginTop: '8px' }}>
            <Button
              isLoading={loading}
              type="submit"
              style={{
                cursor: 'pointer',
              }}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>
          </Box>
          <Box display={'flex'} justifyContent={'center'} textAlign={'center'} gap={1}>
            <Link href="#">
              <Typography variant="subtitle1">{'Não tem uma conta?'}</Typography>
            </Link>
            <Typography variant="subtitle1" fontWeight={'bold'}>
              {'Cadastrar.'}
            </Typography>
          </Box>
        </Form>
      </Content>
      <Notification
        open={openSnackbar}
        message={errorMessage}
        severity="error"
        onClose={() => setOpenSnackbar(false)}
      />
    </Container>
  );
};

export default Home;
