import React, { useEffect, useState, useContext } from 'react';
import Router from 'next/router';

import { getAllAdmins } from '@/services/admins';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { AuthContext } from '@/contexts/AuthContext';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { restoreProfileAdmin, inactiveProfileAdmin } from '@/services/admins';

import {
  colors,
  PageTitle,
  DescriptionText,
  Input,
  Container,
  ContentContainer,
} from '@/styles/globals';

import {
  MdOutlineAddCircle,
  MdSearch,
  MdMoreHoriz,
  MdOutlineVisibility,
  MdOutlineCreate,
  MdOutlineArchive,
  MdDeleteOutline,
  MdOutlineUnarchive,
} from 'react-icons/md';

import IconButton from '@mui/material/IconButton';

import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { Footer, Notification, ModalOfRemove } from '@/components';
import { IAdminProps, IAdminPropsAttributes } from '@/interfaces/IAdmin';

import dynamic from 'next/dynamic';
import { getSession, useSession } from 'next-auth/react';
import { defaultTableValueFormatter } from '../../utils/defaultTableValueFormatter';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Admins = () => {
  const { user, saveToken } = useContext(AuthContext);
  const { data: session } = useSession();

  useEffect(() => {
    if (!user.admin_id) {
      if (session) {
        const token = session.token;
        if (token) {
          saveToken(token);
        }
      }
    }
  }, []);

  const { showTitle, setShowTitle } = useContext(PageTitleContext);

  const [getForStatus, setGetForStatus] = useState<string>('active');

  const [searchFor, setSearchFor] = useState<string>('name');
  const [adminsList, setAdminsList] = useState<IAdminProps[]>([]);
  const [adminsListFiltered, setAdminsListFiltered] = useState<IAdminProps[]>([]);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [rowItem, setRowItem] = useState<IAdminPropsAttributes>({} as IAdminPropsAttributes);
  const open = Boolean(anchorEl);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setRowItem({} as IAdminPropsAttributes);
  };

  const translateRole = (userRole: string) => {
    switch (userRole) {
      case 'lawyer':
        return 'Advogado';
      case 'paralegal':
        return 'Paralegal';
      case 'trainee':
        return 'Estagiario';
      case 'secretary':
        return 'Secretario';
      case 'counter':
        return 'Contador';
      default:
        return userRole;
    }
  };

  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');
    switch (searchFor) {
      case 'name':
        const filteredByName = adminsList.filter(
          admin => regex.test(admin.attributes.name) || regex.test(admin.attributes.last_name),
        );
        setAdminsListFiltered(filteredByName);
        break;

      case 'role':
        const filteredByType = adminsList.filter(admin => regex.test(admin.attributes.role));
        setAdminsListFiltered(filteredByType);
        break;

      default:
        setAdminsListFiltered(adminsList);
        break;
    }

    if (!search) {
      setAdminsListFiltered(adminsList);
    }
  };

  const handleEdit = (user: IAdminPropsAttributes) => {
    Router.push(`/alterar?type=usuario&id=${user.id}`);
  };

  const handleDetails = (user: IAdminPropsAttributes) => {
    Router.push(`/detalhes?type=usuario&id=${user.id}`);
  };

  const handleRestore = async (user: IAdminPropsAttributes) => {
    try {
      await restoreProfileAdmin(user.id);
      setMessage('Cliente restaurado com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao restaurar cliente');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleInactive = async (user: IAdminPropsAttributes) => {
    try {
      await inactiveProfileAdmin(user.id);
      setMessage('Admin inativado com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao inativar admin');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (user: IAdminPropsAttributes) => {
    setRowItem(user);
    setOpenRemoveModal(true);
  };

  const getAdmins = async () => {
    const requestParams = getForStatus === 'active' ? '' : getForStatus;
    const response = await getAllAdmins(requestParams);
    const translatedRole = response.data.map((user: IAdminProps) => ({
      ...user,
      attributes: {
        ...user.attributes,
        role: translateRole(user.attributes.role),
      },
    }));

    setAdminsList(translatedRole);
    setAdminsListFiltered(translatedRole);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    getAdmins();
  }, [refetch, getForStatus]);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
      }
    };

    window.addEventListener('scroll', updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, []);

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={typeMessage}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      {rowItem.id && (
        <Menu
          id="long-menu"
          MenuListProps={{
            'aria-labelledby': 'long-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              style: {
                width: '20ch',
              },
            },
          }}
        >
          <div className="flex flex-col items-start gap-1">
            {rowItem.deleted === true ? (
              <>
                <MenuItem
                  className="flex gap-2 w-full"
                  onClick={() => {
                    handleCloseMenu();
                    handleRestore(rowItem);
                  }}
                >
                  <MdOutlineUnarchive size={22} color={colors.icons} cursor={'pointer'} />
                  <label className="font-medium	cursor-pointer">Ativar</label>
                </MenuItem>

                <MenuItem
                  className="flex gap-2 w-full"
                  onClick={() => {
                    handleCloseMenu();
                    handleDelete(rowItem);
                  }}
                >
                  <MdDeleteOutline size={22} color={colors.icons} cursor={'pointer'} />
                  <label className="font-medium	cursor-pointer">Remover</label>
                </MenuItem>
              </>
            ) : null}

            {!rowItem.deleted ? (
              <>
                <MenuItem
                  className="flex gap-2 w-full"
                  onClick={() => {
                    handleCloseMenu();
                    handleDetails(rowItem);
                  }}
                >
                  <MdOutlineVisibility size={22} color={colors.icons} cursor={'pointer'} />
                  <label className="font-medium	cursor-pointer">Detalhes</label>
                </MenuItem>

                <MenuItem
                  className="flex gap-2 w-full"
                  onClick={() => {
                    handleCloseMenu();
                    handleEdit(rowItem);
                  }}
                >
                  <MdOutlineCreate size={22} color={colors.icons} cursor={'pointer'} />
                  <label className="font-medium	cursor-pointer">Alterar</label>
                </MenuItem>

                {Number(user.admin_id) === Number(rowItem.id) ? null : (
                  <>
                    <MenuItem
                      className="flex gap-2 w-full"
                      onClick={() => {
                        handleCloseMenu();
                        handleInactive(rowItem);
                      }}
                    >
                      <MdOutlineArchive size={22} color={colors.icons} cursor={'pointer'} />
                      <label className="font-medium	cursor-pointer">Inativar</label>
                    </MenuItem>

                    <MenuItem
                      className="flex gap-2 w-full"
                      onClick={() => {
                        handleCloseMenu();
                        handleDelete(rowItem);
                      }}
                    >
                      <MdDeleteOutline size={22} color={colors.icons} cursor={'pointer'} />
                      <label className="font-medium	cursor-pointer">Remover</label>
                    </MenuItem>
                  </>
                )}
              </>
            ) : null}
          </div>
        </Menu>
      )}

      {openRemoveModal && (
        <ModalOfRemove
          isOpen={openRemoveModal}
          onClose={() => setOpenRemoveModal(false)}
          id={rowItem.id}
          textConfirmation={`admin/${rowItem.name}`}
          handleCloseModal={() => {
            setRefetch(!refetch);
            setOpenRemoveModal(false);
          }}
          model={'admin'}
        />
      )}

      <Layout>
        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Usuários'}</PageTitle>

            <div className="flex items-center gap-1 relative font-medium text-[#01013D]">
              <span className="w-[62px] text-[18px]">Ativo:</span>

              <div className="flex items-center gap-[20px]">
                <div className="flex items-center gap-[6px] cursor-pointer">
                  <input
                    type="radio"
                    id="active"
                    name="status"
                    value="active"
                    disabled={isLoading}
                    checked={getForStatus === 'active'}
                    className="w-[16px] h-[16px] cursor-pointer"
                    onChange={() => setGetForStatus('active')}
                  />
                  <label htmlFor="active" className="text-[16px] cursor-pointer">
                    Sim
                  </label>
                </div>
                <div className="flex items-center gap-[6px] cursor-pointer">
                  <input
                    type="radio"
                    id="only_deleted"
                    name="status"
                    value="only_deleted"
                    disabled={isLoading}
                    checked={getForStatus === 'only_deleted'}
                    className="w-[16px] h-[16px] cursor-pointer"
                    onChange={() => setGetForStatus('only_deleted')}
                  />
                  <label htmlFor="only_deleted" className="text-[16px] cursor-pointer">
                    Não
                  </label>
                </div>
                <div className="flex items-center gap-[6px] cursor-pointer">
                  <input
                    type="radio"
                    id="with_deleted"
                    name="status"
                    value="with_deleted"
                    disabled={isLoading}
                    checked={getForStatus === 'with_deleted'}
                    className="w-[16px] h-[16px] cursor-pointer"
                    onChange={() => setGetForStatus('with_deleted')}
                  />
                  <label htmlFor="with_deleted" className="text-[16px] cursor-pointer">
                    Todos
                  </label>
                </div>
              </div>
            </div>
          </div>

          <ContentContainer>
            <Box>
              <Typography mb={'8px'} variant="h6">
                {'Buscar Por'}
              </Typography>
              <Box display={'flex'} gap={'16px'} justifyContent={'space-between'}>
                <Box display={'flex'} gap={'16px'}>
                  <Box display={'flex'} gap={'16px'}>
                    <Button
                      onClick={() => setSearchFor('name')}
                      variant={searchFor === 'name' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Nome'}
                    </Button>
                    <Button
                      value="role"
                      onClick={e => setSearchFor('role')}
                      variant={searchFor === 'role' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Atribuição'}
                    </Button>
                  </Box>
                  <Input>
                    <input
                      type="text"
                      placeholder="Buscar usuário"
                      onChange={e => handleSearch(e.target.value)}
                    />
                    <MdSearch size={25} />
                  </Input>
                </Box>
                {session?.role === 'counter' ? null : (
                  <Button
                    variant="contained"
                    color="primary"
                    className="gap-2"
                    onClick={() => {
                      Router.push('/cadastrar?type=usuario');
                    }}
                    sx={{
                      backgroundColor: colors.quartiary,
                      color: colors.white,
                      height: 36,
                      '&:hover': {
                        backgroundColor: colors.quartiaryHover,
                      },
                    }}
                  >
                    <DescriptionText style={{ cursor: 'pointer' }}>{'Adicionar'}</DescriptionText>
                    <MdOutlineAddCircle size={20} />
                  </Button>
                )}
              </Box>
            </Box>
            <Box mt={'20px'} sx={{ height: 450 }}>
              <DataGrid
                disableColumnMenu
                disableRowSelectionOnClick
                loading={isLoading}
                slots={{
                  loadingOverlay: LinearProgress,
                }}
                rows={
                  adminsListFiltered &&
                  adminsListFiltered.map((admin: IAdminProps) => ({
                    id: Number(admin.id),
                    deleted: admin.attributes.deleted,
                    role: admin.attributes.role,
                    name: `${admin.attributes.name} ${admin.attributes.last_name}`,
                    email: admin.attributes.email,
                  }))
                }
                columns={[
                  {
                    width: 80,
                    field: 'id',
                    headerName: 'ID',
                    cellClassName: 'font-medium text-black',
                    align: 'center',
                    headerAlign: 'center',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 300,
                    field: 'name',
                    headerName: 'Nome',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 180,
                    field: 'role',
                    headerName: 'Atribuição',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    field: 'email',
                    headerName: 'E-mail',
                    sortable: false,
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 100,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
                    sortable: false,
                    editable: false,
                    valueFormatter: defaultTableValueFormatter,
                    renderCell: (params: any) => (
                      <div>
                        <IconButton
                          aria-label="more"
                          id="long-button"
                          aria-controls={open ? 'long-menu' : undefined}
                          aria-expanded={open ? 'true' : undefined}
                          aria-haspopup="true"
                          onClick={e => {
                            setRowItem(params.row);
                            handleOpenMenu(e);
                          }}
                        >
                          <MdMoreHoriz size={22} color={colors.icons} cursor={'pointer'} />
                        </IconButton>
                      </div>
                    ),
                  },
                ]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                localeText={{
                  noRowsLabel: 'Nenhum usuário encontrado',
                  MuiTablePagination: {
                    labelRowsPerPage: 'Linhas por página',
                    labelDisplayedRows(paginationInfo) {
                      return `${paginationInfo.from}- ${paginationInfo.to} de ${paginationInfo.count}`;
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
              />
            </Box>
          </ContentContainer>
        </Container>
        <Footer />
      </Layout>
    </>
  );
};

export default Admins;

export const getServerSideProps = async (ctx: any) => {
  const session = await getSession(ctx);

  if (session?.role === 'counter' || session?.role === 'secretary') {
    return {
      redirect: {
        destination: '/clientes',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
