import React, { useEffect, useState, useContext } from 'react';
import { withAuth } from '@/middleware/withAuth';
import Router from 'next/router';

import { getAllAdmins } from '@/services/admins';
import { PageTitleContext } from '@/contexts/PageTitleContext';

import {
  colors,
  PageTitle,
  DescriptionText,
  Input,
  Container,
  ContentContainer,
} from '@/styles/globals';

import { MdOutlineAddCircle, MdSearch, MdModeEdit, MdArchive, MdVisibility } from 'react-icons/md';

import { Box, Button, Typography } from '@mui/material';
import { DataGrid, GridRowParams } from '@mui/x-data-grid';

import { Footer } from '@/components';
import { IAdminProps } from '@/interfaces/IAdmin';

import dynamic from 'next/dynamic';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Admins = () => {
  const { showTitle, setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const [searchFor, setSearchFor] = useState<string>('name');
  const [adminsList, setAdminsList] = useState<IAdminProps[]>([]);
  const [adminsListFiltered, setAdminsListFiltered] = useState<IAdminProps[]>([]);

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

  const handleEdit = (user: GridRowParams) => {
    Router.push(`/alterar?type=usuario&id=${user.id}`);
  };

  const handleDetails = (user: GridRowParams) => {
    Router.push(`/detalhes?type=usuario&id=${user.id}`);
  };

  useEffect(() => {
    const getAdmins = async () => {
      const response = await getAllAdmins();
      setAdminsList(response.data);
      setAdminsListFiltered(response.data);
    };

    getAdmins();
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
        setPageTitle('Usuários');
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
        setPageTitle('');
      }
    };

    window.addEventListener('scroll', updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, []);

  return (
    <>
      <Layout>
        <Container>
          <PageTitle showTitle={showTitle}>{'Usuários'}</PageTitle>
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
                <Button
                  variant="contained"
                  color="primary"
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
                  <DescriptionText style={{ cursor: 'pointer' }} className="ml-8">
                    {'Adicionar'}
                  </DescriptionText>
                  <MdOutlineAddCircle size={20} />
                </Button>
              </Box>
            </Box>
            <Box mt={'20px'} sx={{ height: 450 }}>
              <DataGrid
                disableColumnMenu
                disableRowSelectionOnClick
                rows={
                  adminsListFiltered &&
                  adminsListFiltered.map((admin: IAdminProps) => ({
                    id: admin.id,
                    role:
                      admin.attributes.role === 'lawyer'
                        ? 'Advogado'
                        : admin.attributes.role === 'paralegal'
                        ? 'Paralegal'
                        : admin.attributes.role === 'trainee'
                        ? 'Estagiário'
                        : admin.attributes.role === 'secretary'
                        ? 'Secretário(a)'
                        : admin.attributes.role === 'excounter'
                        ? 'Contador(a)'
                        : '',
                    name: `${admin.attributes.name} ${admin.attributes.last_name}`,
                  }))
                }
                columns={[
                  {
                    width: 100,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
                    sortable: false,
                    editable: false,
                    renderCell: (params: any) => (
                      <Box width={'100%'} display={'flex'} justifyContent={'space-around'}>
                        <MdVisibility
                          size={22}
                          color={colors.icons}
                          cursor={'pointer'}
                          onClick={() => handleDetails(params.row)}
                        />
                        <MdModeEdit
                          size={22}
                          color={colors.icons}
                          cursor={'pointer'}
                          onClick={() => handleEdit(params.row)}
                        />
                        <MdArchive size={22} color={colors.icons} />
                      </Box>
                    ),
                  },
                  {
                    width: 400,
                    field: 'name',
                    headerName: 'Nome',
                  },
                  {
                    width: 180,
                    field: 'role',
                    headerName: 'Atribuição',
                  },
                  {
                    width: 200,
                    field: 'email',
                    headerName: 'E-mail',

                    sortable: false,
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

export default withAuth(Admins);
