'use client';

import { useState, useEffect, useContext } from 'react';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

import { ActiveLink } from '@/components';
import Link from 'next/link';

import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';

import { AppBarProps, ILayoutProps } from '@/interfaces/ILayout';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import { Typography, Stack, Toolbar, CssBaseline, IconButton } from '@mui/material';

import {
  MdHome,
  MdGroups,
  MdHandyman,
  MdOutlineFormatListNumbered,
  MdPerson,
  MdAccountBalance,
  MdOutlineArrowRight,
  MdOutlineListAlt,
  MdOutlineDescription,
  MdMenu,
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
} from 'react-icons/md';

import { AiOutlineUser } from 'react-icons/ai';
import { IoExitOutline } from 'react-icons/io5';

import Image from 'next/image';
import { colors, HeaderPageTitle } from '@/styles/globals';
import { Container, SelectContainer, Flex, MenuItem, CloseDropdown, TitleWrapper } from './styles';

import Logo from '../../assets/logo-white.png';
import Profile from '../../assets/Profile.png';
import { getAllAdmins } from '@/services/admins';
import { UserContext } from '@/contexts/UserContext';
import { useSession } from 'next-auth/react';

const drawerWidth = 224;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 12px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: colors.white,
  backgroundColor: colors.primary,
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,

  '& svg': {
    color: colors.white,
  },
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: colors.primary,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const Layout = ({ children }: ILayoutProps) => {
  const theme = useTheme();
  const { asPath } = useRouter();
  const { handleLogout } = useContext(AuthContext);
  const { showTitle, pageTitle } = useContext(PageTitleContext);
  const { data: session } = useSession();

  const supportsLocalStorage = typeof window !== 'undefined' && window.localStorage;
  const storedOpenSidebar = supportsLocalStorage ? localStorage.getItem('openSidebar') : null;
  const initialSidebarState = storedOpenSidebar === 'true';

  const [openSidebar, setOpenSidebar] = useState(initialSidebarState);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isUserCounter, setIsUserCounter] = useState(true);

  const handleDrawerOpen = () => {
    setOpenSidebar(true);
  };

  const handleDrawerClose = () => {
    setOpenSidebar(false);
  };

  useEffect(() => {
    if (supportsLocalStorage) {
      localStorage.setItem('openSidebar', openSidebar.toString());
    }
  }, [openSidebar]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={openSidebar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              ...(openSidebar && { display: 'none' }),
              paddingLeft: '12px',
            }}
          >
            <MdMenu />
          </IconButton>
          <TitleWrapper showTitle={showTitle}>
            <HeaderPageTitle
              style={{
                color: 'white',
                margin: 0,
                marginLeft: openSidebar ? '0px' : '45px',
              }}
            >
              {pageTitle}
            </HeaderPageTitle>
          </TitleWrapper>
          <SelectContainer onClick={() => setOpenUserMenu(!openUserMenu)} isOpen={openUserMenu}>
            <CloseDropdown className="close" onClick={() => setOpenUserMenu(false)} />
            <Image width={28} height={28} src={Profile} alt="Logo" priority />
            <Flex>
              <Flex>
                <Typography fontSize="md" color={colors.white} marginLeft={2} marginRight={2}>
                  {'procstudio'}
                </Typography>
              </Flex>
              <MdKeyboardArrowDown size={24} className="arrow" />
            </Flex>
            {openUserMenu && (
              <Flex className="selectItemsContainer">
                <Link href={'/clientes'}>
                  <Box className={'item'}>
                    <AiOutlineUser size={20} />
                    <Typography variant="subtitle2"> {'Conta'} </Typography>
                  </Box>
                </Link>
                <Link href={'/'}>
                  <Box className={'item'} onClick={handleLogout}>
                    <IoExitOutline size={20} />
                    <Typography variant="subtitle2"> {'Sair'} </Typography>
                  </Box>
                </Link>
              </Flex>
            )}
          </SelectContainer>
        </Toolbar>
      </AppBar>
      <Container>
        <Drawer variant="permanent" open={openSidebar}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? null : <MdKeyboardArrowLeft />}
            </IconButton>
          </DrawerHeader>
          {openSidebar && (
            <>
              <Flex className="imgContainer" pb={35} display={'flex'} justifyContent={'center'}>
                <Image src={Logo} alt="Logo" priority />
              </Flex>
            </>
          )}

          <Flex color={colors.white} sx={{ width: '100%' }}>
            <Stack spacing="8" sx={{ width: '100%' }}>
              <ActiveLink href="/home">
                <MenuItem
                  sx={{
                    backgroundColor:
                      asPath === '/home' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  }}
                >
                  <MdHome size={24} className="icon" />
                  {openSidebar && (
                    <>
                      <Typography fontWeight="regular">{'Página inicial'}</Typography>
                      <MdOutlineArrowRight size={24} className="arrow" />
                    </>
                  )}
                </MenuItem>
              </ActiveLink>

              <ActiveLink href="/clientes">
                <MenuItem
                  sx={{
                    backgroundColor:
                      asPath === '/clientes' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  }}
                >
                  <MdGroups size={24} className="icon" />
                  {openSidebar && (
                    <>
                      <Typography fontWeight="regular">{'Clientes'}</Typography>
                      <MdOutlineArrowRight size={24} className="arrow" />
                    </>
                  )}
                </MenuItem>
              </ActiveLink>

              <ActiveLink href="/trabalhos">
                <MenuItem
                  sx={{
                    backgroundColor:
                      asPath === '/trabalhos' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  }}
                >
                  <MdHandyman size={24} className="icon" />
                  {openSidebar && (
                    <>
                      <Typography fontWeight="regular">{'Trabalhos'}</Typography>

                      <MdOutlineArrowRight size={24} className="arrow arrowWork" />
                    </>
                  )}
                </MenuItem>
              </ActiveLink>

              {session?.role === 'secretary' || session?.role === 'counter' ? null : (
                <ActiveLink href="/tarefas">
                  <MenuItem
                    sx={{
                      backgroundColor:
                        asPath === '/tarefas' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    }}
                  >
                    <MdOutlineFormatListNumbered size={24} className="icon" />
                    {openSidebar && (
                      <>
                        <Typography fontWeight="regular">{'Tarefas'}</Typography>
                        <MdOutlineArrowRight size={24} className="arrow" />
                      </>
                    )}
                  </MenuItem>
                </ActiveLink>
              )}

              {session?.role === 'counter' || session?.role === 'secretary' ? null : (
                <ActiveLink href="/usuarios">
                  <MenuItem
                    sx={{
                      backgroundColor:
                        asPath === '/usuarios' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    }}
                  >
                    <MdPerson size={24} className="icon" />
                    {openSidebar && (
                      <>
                        <Typography fontWeight="regular">{'Usuários'}</Typography>
                        <MdOutlineArrowRight size={24} className="arrow" />
                      </>
                    )}
                  </MenuItem>
                </ActiveLink>
              )}

              {session?.role === 'counter' || session?.role === 'secretary' ? null : (
                <ActiveLink href="/escritorios">
                  <MenuItem
                    sx={{
                      backgroundColor:
                        asPath === '/escritorios' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    }}
                  >
                    <MdAccountBalance size={24} className="icon" />
                    {openSidebar && (
                      <>
                        <Typography fontWeight="regular">{'Escritório'}</Typography>
                        <MdOutlineArrowRight size={24} className="arrow" />
                      </>
                    )}
                  </MenuItem>
                </ActiveLink>
              )}

              {/* <ActiveLink href="/reports">
                <MenuItem
                  sx={{
                    backgroundColor:
                      asPath === '/reports' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  }}
                >
                  <MdOutlineListAlt size={24} className="icon" />
                  {openSidebar && (
                    <>
                      <Typography fontWeight="regular">{'Relatórios'}</Typography>
                      <MdOutlineArrowRight size={24} className="arrow" />
                    </>
                  )}
                </MenuItem>
              </ActiveLink> */}

              {/* <ActiveLink href="/documents">
                <MenuItem
                  sx={{
                    backgroundColor:
                      asPath === '/documents' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  }}
                >
                  <MdOutlineDescription size={24} className="icon" />
                  {openSidebar && (
                    <>
                      <Typography fontWeight="regular">{'Documentos'}</Typography>
                      <MdOutlineArrowRight size={24} className="arrow" />
                    </>
                  )}
                </MenuItem>
              </ActiveLink> */}
            </Stack>
          </Flex>
        </Drawer>
      </Container>

      <Box component="main" sx={{ flexGrow: 1, width: '100%', overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
