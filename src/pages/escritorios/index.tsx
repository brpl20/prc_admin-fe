import React, { useEffect, useState, useContext } from 'react';
import { withAuth } from '@/middleware/withAuth';
import Router from 'next/router';

import { getAllOffices } from '@/services/offices';
import { PageTitleContext } from '@/contexts/PageTitleContext';

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
  MdVisibility,
  MdModeEdit,
  MdArchive,
  MdGavel,
} from 'react-icons/md';

import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid, GridRowParams } from '@mui/x-data-grid';

import dynamic from 'next/dynamic';
import { Footer } from '@/components';
import { IOfficeProps } from '@/interfaces/IOffice';
import { cnpjMask } from '@/utils/masks';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

interface IOfficesProps {
  city: string;
  cnpj: string;
  id: string;
  name: string;
  office_type: string;
  site: string;
}

const Offices = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showTitle, setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const [searchFor, setSearchFor] = useState<string>('name');
  const [officesList, setOfficesList] = useState<IOfficeProps[]>([]);
  const [officesListFiltered, setOfficesListFiltered] = useState<IOfficeProps[]>([]);

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

      case 'office_type':
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

  const handleEdit = (user: GridRowParams) => {
    Router.push(`/alterar?type=escritorio&id=${user.id}`);
  };

  const handleDetails = (office: IOfficesProps) => {
    Router.push(`/detalhes?type=escritorio&id=${office.id}`);
  };

  useEffect(() => {
    const getOffices = async () => {
      setIsLoading(true);
      const response = await getAllOffices();
      setOfficesList(response.data);
      setOfficesListFiltered(response.data);
      setIsLoading(false);
    };

    getOffices();
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
        setPageTitle('Escritórios');
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
          <PageTitle showTitle={showTitle}>{'Escritórios'}</PageTitle>
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
                      onClick={e => setSearchFor('office_type')}
                      variant={searchFor === 'office_type' ? 'contained' : 'outlined'}
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
                loading={isLoading}
                slots={{
                  noRowsOverlay: () =>
                    isLoading ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LinearProgress />
                      </Box>
                    ) : (
                      <Typography variant="h6">{'Nenhum cliente encontrado'}</Typography>
                    ),
                }}
                rows={
                  officesListFiltered &&
                  officesListFiltered.map((office: IOfficeProps) => ({
                    id: office.id,
                    name: office.attributes.name,
                    cnpj: office.attributes.cnpj ? cnpjMask(office.attributes.cnpj) : '',
                    office_type: office.attributes.office_type_description,
                    city: office.attributes.city,
                    site: office.attributes.site,
                  }))
                }
                columns={[
                  {
                    width: 180,
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
                        <MdGavel size={22} color={colors.icons} />
                        <MdArchive size={22} color={colors.icons} />
                      </Box>
                    ),
                  },
                  {
                    width: 250,
                    field: 'name',
                    headerName: 'Nome',
                  },
                  {
                    width: 180,
                    field: 'cnpj',
                    headerName: 'CNPJ',
                  },
                  {
                    width: 140,
                    field: 'office_type',
                    headerName: 'Tipo',
                    sortable: false,
                  },
                  {
                    field: 'city',
                    headerName: 'Cidade',
                    sortable: false,
                  },
                  {
                    width: 250,
                    field: 'site',
                    headerName: 'Site',
                    sortable: false,
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

export default withAuth(Offices);
