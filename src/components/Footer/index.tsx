import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';

import { Container } from './styles';
import Logo from '../../assets/logo-colors.png';
import Facebook from '../../assets/Facebook.png';
import Linkedin from '../../assets/Linkedin.png';
import x from '../../assets/x.svg';

import { MdKeyboardArrowRight, MdKeyboardArrowUp } from 'react-icons/md';
import { colors } from '@/styles/globals';

const Footer = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Container>
      <Box display={'flex'} className="content">
        <Box>
          <Box>
            <Image src={Logo} alt="Logo" priority />
            <Typography>{'Tecnologia para uma vida mais fácil.'}</Typography>
          </Box>
        </Box>

        <Box>
          <Box>
            <Box display={'flex'}>
              <Typography fontSize="md" color={colors.black} marginRight={1}>
                {'Mapa do Sistema'}
              </Typography>
              <MdKeyboardArrowRight size={22} className="arrow" />
            </Box>
            <Link href={'/clientes'} className="links">
              <Typography fontSize="sm">{'Clientes'}</Typography>
            </Link>
            <Link href={'/trabalhos'} className="links">
              <Typography fontSize="sm">{'Trabalhos'}</Typography>
            </Link>
            <Link href={'/tarefas'} className="links">
              <Typography fontSize="sm">{'Tarefas'}</Typography>
            </Link>
            <Link href={'/users'} className="links">
              <Typography fontSize="sm">{'Usuários'}</Typography>
            </Link>
          </Box>
        </Box>

        <Box>
          <Box>
            <Typography fontSize="md" color={colors.black}>
              {`ProcStudio ${currentYear}`}
            </Typography>
            <Typography fontSize="sm">
              {'Licenciado para ProcStudio'}
            </Typography>
            <Typography fontSize="sm">{'Rui Barbosa,'}</Typography>
            <Typography fontSize="sm">{'nº 262, Cascavel - PR'}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              cursor: 'pointer',
            }}
            onClick={scrollToTop}
          >
            <Typography fontSize="md" color={colors.black} marginRight={1}>
              {'Voltar ao topo'}
            </Typography>
            <MdKeyboardArrowUp size={22} className="arrow" />
          </Box>

          <Box display={'flex'} marginLeft={'auto'}>
            <Link href={'/'}>
              <Image src={Linkedin} alt="Logo" priority />
            </Link>

            <Link href={'/'}>
              <Image src={Facebook} alt="Logo" priority />
            </Link>

            <Link href={'/'}>
              <Image src={x} alt="Logo" priority />
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Footer;
