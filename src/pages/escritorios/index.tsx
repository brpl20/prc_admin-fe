import React, { useEffect, useState, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';

import { inactiveOffice, restoreOffice } from '@/services/offices';

import { getAllOffices, getOfficeById } from '@/services/offices';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { AuthContext } from '@/contexts/AuthContext';

import {
  colors,
  PageTitle,
  DescriptionText,
  Input,
  Container,
  ContentContainer,
} from '@/styles/globals';

import {
  MdSearch,
  MdMoreHoriz,
  MdOutlineAddCircle,
  MdOutlineVisibility,
  MdOutlineCreate,
  MdOutlineArchive,
  MdDeleteOutline,
  MdOutlineUnarchive,
} from 'react-icons/md';
import IconButton from '@mui/material/IconButton';

import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import dynamic from 'next/dynamic';
import { Footer, Notification, DeleteModal } from '@/components';

import { IOfficeProps, IOfficePropsAttributes } from '@/interfaces/IOffice';
import { getAllAdmins } from '@/services/admins';
import { getSession, useSession } from 'next-auth/react';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { defaultTableValueFormatter } from '../../utils/defaultTableValueFormatter';

const Offices = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);
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

  const [refetch, setRefetch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

  const [getForStatus, setGetForStatus] = useState<string>('active');
  const [searchFor, setSearchFor] = useState<string>('name');
  const [officesList, setOfficesList] = useState<IOfficeProps[]>([]);
  const [officesListFiltered, setOfficesListFiltered] = useState<IOfficeProps[]>([]);

  const [userType, setUserType] = useState<string>('');
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [rowItem, setRowItem] = useState<IOfficePropsAttributes>({} as IOfficePropsAttributes);

  const open = Boolean(anchorEl);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [allowedToRemove, setAllowedToRemove] = useState<boolean>(false);
  const [profilesAdminsOfOffice, setProfilesAdminsOfOffice] = useState<string[]>([]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setRowItem({} as IOfficePropsAttributes);
  };

  const getRowClassName = (params: any) => {
    return params.rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
  };

  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');

    switch (searchFor) {
      case 'name':
        const filteredByName = officesList.filter(office => regex.test(office.attributes.name));

        setOfficesListFiltered(filteredByName);
        break;

      case 'office_type_description':
        const filteredByOfficeType = officesList.filter(office =>
          regex.test(office.attributes.office_type_description),
        );
        setOfficesListFiltered(filteredByOfficeType);
        break;

      case 'cnpj':
        const filteredByCnpj = officesList.filter(office => regex.test(office.attributes.cnpj));
        setOfficesListFiltered(filteredByCnpj);
        break;

      default:
        setOfficesListFiltered(officesList);
        break;
    }

    if (!search) {
      setOfficesListFiltered(officesList);
    }
  };

  const handleEdit = (user: IOfficePropsAttributes) => {
    Router.push(`/alterar?type=escritorio&id=${user.id}`);
  };

  const handleDetails = (office: IOfficePropsAttributes) => {
    Router.push(`/detalhes?type=escritorio&id=${office.id}`);
  };

  const handleRestore = async (office: IOfficePropsAttributes) => {
    try {
      await restoreOffice(office.id);
      setMessage('Escritório restaurado com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao restaurar escritório');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleInactive = async (office: IOfficePropsAttributes) => {
    try {
      await inactiveOffice(office.id);
      setMessage('Escritório inativado com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao inativar escritório');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (office: IOfficePropsAttributes) => {
    setRowItem(office);
    setOpenRemoveModal(true);
  };

  useEffect(() => {
    const getUserType = async () => {
      const response = await getAllAdmins('');
      const admins = response.data;

      const admin = admins.find((admin: any) => admin.attributes.email == user.email);

      if (admin?.attributes?.role == 'counter') {
        setUserType('counter');
        router.push('/clientes');
      }
    };

    if (user) {
      getUserType();
    }
  }, [user, router]);

  const getOffices = async () => {
    const requestParams = getForStatus === 'active' ? '' : getForStatus;

    const response = await getAllOffices(requestParams);

    setOfficesList(response.data);
    setOfficesListFiltered(response.data);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    getOffices();
  }, [userType, refetch, getForStatus]);

  const getProfilesAdminsOfOffice = async (officeId: string) => {
    const response = await getOfficeById(officeId);
    const office = response.data;
    setProfilesAdminsOfOffice(office.attributes.profile_admins);
  };

  const validateAdmin = () => {
    const isAllowed = profilesAdminsOfOffice.includes(user.admin_id);
    setAllowedToRemove(isAllowed);
  };

  useEffect(() => {
    validateAdmin();
  }, [profilesAdminsOfOffice]);

  useEffect(() => {
    if (rowItem.id && rowItem.deleted === false) {
      getProfilesAdminsOfOffice(rowItem.id);
    }
  }, [rowItem]);

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

                {rowItem.responsible_lawyer &&
                Number(user.admin_id) === Number(rowItem.responsible_lawyer) &&
                allowedToRemove === false ? null : (
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
        <DeleteModal
          isOpen={openRemoveModal}
          onClose={() => setOpenRemoveModal(false)}
          id={rowItem.id}
          entityName={rowItem.name}
          handleCloseModal={() => {
            setRefetch(!refetch);
            setOpenRemoveModal(false);
          }}
          model={'escritório'}
        />
      )}

      <Layout>
        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Escritórios'}</PageTitle>

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
                      value="cnpj"
                      onClick={e => setSearchFor('cnpj')}
                      variant={searchFor === 'cnpj' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'CNPJ'}
                    </Button>
                    <Button
                      onClick={e => setSearchFor('office_type_description')}
                      variant={searchFor === 'office_type_description' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Tipo'}
                    </Button>
                  </Box>
                  <Input>
                    <input
                      type="text"
                      placeholder="Buscar Escritório"
                      onChange={e => handleSearch(e.target.value)}
                    />
                    <MdSearch size={25} />
                  </Input>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  className="gap-2"
                  onClick={() => {
                    Router.push('/cadastrar?type=escritorio');
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
                  officesListFiltered &&
                  officesListFiltered.map((office: IOfficeProps) => ({
                    id: Number(office.id),
                    name: office.attributes.name,
                    deleted: office.attributes.deleted,
                    profile_admins: office.attributes.profile_admins,
                    responsible_lawyer: office.attributes.responsible_lawyer_id,
                    cnpj: office.attributes.cnpj ? office.attributes.cnpj : '',
                    office_type_description: office.attributes.office_type_description,
                    city: office.attributes.city,
                    site: office.attributes.site,
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
                    flex: 1,
                    field: 'name',
                    headerName: 'Nome',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 180,
                    field: 'cnpj',
                    headerName: 'CNPJ',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 140,
                    field: 'office_type_description',
                    headerName: 'Tipo',
                    sortable: false,
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 160,
                    field: 'city',
                    headerName: 'Cidade',
                    sortable: false,
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 100,
                    maxWidth: 100,
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
                getRowClassName={getRowClassName}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                localeText={{
                  noRowsLabel: 'Nenhum escritório encontrado',
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

export default Offices;

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
