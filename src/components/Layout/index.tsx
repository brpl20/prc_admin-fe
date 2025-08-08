'use client';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import { ActiveLink } from '@/components';

import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';

import { AppBarProps, ILayoutProps } from '@/interfaces/ILayout';
import { CssBaseline, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { CSSObject, styled, Theme, useTheme } from '@mui/material/styles';

import {
  MdAccountBalance,
  MdGroups,
  MdHandyman,
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
  MdMenu,
  MdOutlineArrowRight,
  MdOutlineFormatListNumbered,
  MdPerson,
  MdDashboard,
} from 'react-icons/md';

import { AiOutlineUser } from 'react-icons/ai';
import { IoDocumentText, IoExitOutline } from 'react-icons/io5';

import { colors, HeaderPageTitle } from '@/styles/globals';
import Image from 'next/image';
import { CloseDropdown, Container, Flex, MenuItem, TitleWrapper } from './styles';

import { SelectContainer, SelectItem, SelectItemsContainer } from '@/components/SelectContainer';
import { signOut, useSession } from 'next-auth/react';
import { TbLoader2 } from 'react-icons/tb';
import Logo from '../../assets/logo-white.png';
import Profile from '../../assets/Profile.png';

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
  const { asPath, route } = useRouter();
  const { data: session } = useSession();

  const { showTitle, pageTitle } = useContext(PageTitleContext);

  const title =
    route === '/clientes'
      ? 'Clientes'
      : route === '/trabalhos'
        ? 'Trabalhos'
        : route === '/documentos'
          ? 'Documentos'
          : route === '/tarefas'
            ? 'Tarefas'
            : route === '/usuarios'
              ? 'Usuários'
              : route === '/escritorios'
                ? 'Escritórios'
                : pageTitle;

  const supportsLocalStorage = typeof window !== 'undefined' && window.localStorage;
  const storedOpenSidebar = supportsLocalStorage ? localStorage.getItem('openSidebar') : null;
  const initialSidebarState = storedOpenSidebar === 'true';

  const [openSidebar, setOpenSidebar] = useState(initialSidebarState);
  const [openUserMenu, setOpenUserMenu] = useState(false);

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

  function formatUserName(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length <= 2) return fullName;

    return `${names[0]} ${names[1]}...`;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/login';
  };

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
              {title}
            </HeaderPageTitle>
          </TitleWrapper>
          <SelectContainer onClick={() => setOpenUserMenu(!openUserMenu)} isOpen={openUserMenu}>
            <CloseDropdown className="close" onClick={() => setOpenUserMenu(false)} />

            <Image width={28} height={28} src={Profile} alt="Logo" priority />
            <Flex className="min-w-0">
              <Flex className="overflow-hidden select-none">
                {session ? (
                  <Typography fontSize="md" color={colors.white} className="px-4 truncate">
                    {formatUserName(`${session?.name} ${session?.last_name}`)}
                  </Typography>
                ) : (
                  <Flex>
                    <Typography fontSize="md" color={colors.white} className="px-4 truncate">
                      Procstudio
                    </Typography>
                    <TbLoader2 className="animate-spin mr-4" />
                  </Flex>
                )}
              </Flex>
              <MdKeyboardArrowDown
                size={24}
                className={`arrow ${openUserMenu ? 'rotate-180' : ''}`}
              />
            </Flex>
            {openUserMenu && (
              <SelectItemsContainer>
                {/* <SelectItem href={`/alterar?type=usuario&id=${user?.profile?.id}`}> */}
                <SelectItem href={`/alterar?type=usuario&id=teste`}>
                  <AiOutlineUser size={20} />
                  <span className="text-sm font-medium">Conta</span>
                </SelectItem>

                <SelectItem href="/" onClick={handleSignOut}>
                  <IoExitOutline size={20} />
                  <span className="text-sm font-medium">Sair</span>
                </SelectItem>
              </SelectItemsContainer>
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
              <ActiveLink href="/team-dashboard">
                <MenuItem
                  sx={{
                    backgroundColor:
                      asPath === '/team-dashboard' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  }}
                >
                  <MdDashboard size={24} className="icon" />
                  {openSidebar && (
                    <>
                      <Typography fontWeight="regular">{'Dashboard'}</Typography>
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

              <ActiveLink href="/documentos">
                <MenuItem
                  sx={{
                    backgroundColor:
                      asPath === '/documentos' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  }}
                >
                  <IoDocumentText size={24} className="icon" />
                  {openSidebar && (
                    <>
                      <Typography fontWeight="regular">{'Documentos'}</Typography>

                      <MdOutlineArrowRight size={24} className="arrow arrowWork" />
                    </>
                  )}
                </MenuItem>
              </ActiveLink>

              {session?.role === 'counter' ? null : (
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
