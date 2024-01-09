import React, { useEffect, useState, useContext } from 'react';
import { withAuth } from '@/middleware/withAuth';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';

import { PageTitleContext } from '@/contexts/PageTitleContext';

import { getAllCustomers } from '@/services/customers';

import {
  colors,
  PageTitle,
  Input,
  Flex,
  CloseDropdown,
  ContentContainer,
  Container,
  SelectContainer,
} from '@/styles/globals';

import {
  MdSearch,
  MdVisibility,
  MdModeEdit,
  MdArchive,
  MdGavel,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from 'react-icons/md';

import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { Footer } from '@/components';
import dynamic from 'next/dynamic';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

import { ICustomerProps } from '@/interfaces/ICustomer';
import { cnpjMask, cpfMask, phoneMask } from '@/utils/masks';

import { CustomerContext } from '@/contexts/CustomerContext';

const Customers = () => {
  const { setCustomerForm } = useContext(CustomerContext);

  const { showTitle, setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openCreationMenu, setOpenCreationMenu] = useState<boolean>(false);
  const [searchFor, setSearchFor] = useState<string>('name');
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);
  const [customersListFiltered, setCustomersListFiltered] = useState<ICustomerProps[]>([]);

  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');

    let filteredList = [];

    if (!customersList) {
      return;
    }

    switch (searchFor) {
      case 'name':
        filteredList = customersList.filter((customer: ICustomerProps) =>
          regex.test(customer.attributes.name),
        );
        break;

      case 'type':
        filteredList = customersList.filter((customer: ICustomerProps) =>
          regex.test(customer.attributes.customer_type),
        );
        break;

      case 'identification':
        filteredList = customersList.filter((customer: ICustomerProps) =>
          regex.test(customer.attributes.cpf),
        );
        break;

      default:
        filteredList = [...customersList];
        break;
    }

    setCustomersListFiltered(filteredList);
  };

  const handleEdit = (customer: ICustomerProps) => {
    const customerTypeUnformatted = customer.type;
    const customerType =
      customerTypeUnformatted == 'Pessoa Física'
        ? 'physical_person'
        : customerTypeUnformatted == 'Pessoa Jurídica'
        ? 'legal_person'
        : customerTypeUnformatted == 'Contador'
        ? 'counter'
        : 'representative';

    switch (customerType) {
      case 'physical_person':
        Router.push(`/alterar?type=cliente/pessoa_fisica&id=${customer.id}`);
        break;
      case 'legal_person':
        Router.push(`/alterar?type=cliente/pessoa_juridica&id=${customer.id}`);
        break;
      case 'counter':
        Router.push(`/alterar?type=cliente/contador&id=${customer.id}`);
        break;
      case 'representative':
        Router.push(`/alterar?type=cliente/representante&id=${customer.id}`);
        break;
      default:
        break;
    }
  };

  const handleDetails = (customer: ICustomerProps) => {
    const customerTypeUnformatted = customer.type;
    const customerType =
      customerTypeUnformatted == 'Pessoa Física'
        ? 'physical_person'
        : customerTypeUnformatted == 'Pessoa Jurídica'
        ? 'legal_person'
        : customerTypeUnformatted == 'Contador'
        ? 'counter'
        : 'representative';

    switch (customerType) {
      case 'physical_person':
        Router.push(`/detalhes?type=cliente/pessoa_fisica&id=${customer.id}`);
        break;
      case 'legal_person':
        Router.push(`/detalhes?type=cliente/pessoa_juridica&id=${customer.id}`);
        break;
      case 'counter':
        Router.push(`/detalhes?type=cliente/contador&id=${customer.id}`);
        break;
      case 'representative':
        Router.push(`/detalhes?type=cliente/representante&id=${customer.id}`);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const getCustomers = async () => {
      const response = await getAllCustomers();
      setCustomersList(response.data);
      setCustomersListFiltered(response.data);
      setIsLoading(false);
    };

    getCustomers();

    setCustomerForm({});
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
        setPageTitle('Clientes');
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
          <PageTitle showTitle={showTitle}>{'Clientes'}</PageTitle>
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
                      value="type"
                      onClick={() => setSearchFor('type')}
                      variant={searchFor === 'type' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Tipo'}
                    </Button>
                    <Button
                      onClick={() => setSearchFor('identification')}
                      variant={searchFor === 'identification' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'CPF/CNPJ'}
                    </Button>
                  </Box>
                  <Input>
                    <input
                      type="text"
                      placeholder="Buscar Cliente"
                      onChange={e => handleSearch(e.target.value)}
                    />
                    <MdSearch size={25} />
                  </Input>
                </Box>

                <SelectContainer
                  onClick={() => setOpenCreationMenu(!openCreationMenu)}
                  isOpen={openCreationMenu}
                >
                  <Flex className="container">
                    <CloseDropdown className="close" onClick={() => setOpenCreationMenu(false)} />
                    <Flex className="title">
                      <Typography variant="subtitle2">{'Adicionar'}</Typography>
                      <MdKeyboardArrowDown size={24} className="arrow" />
                    </Flex>
                  </Flex>
                  {openCreationMenu && (
                    <Flex className="selectItemsContainer">
                      <Link href={'/cadastrar?type=cliente/pessoa_fisica'}>
                        <Box className={'item'}>
                          <Typography variant="subtitle2">{'Pessoa Física'}</Typography>
                          <MdKeyboardArrowRight size={24} color={colors.white} />
                        </Box>
                      </Link>
                      <Link href={'/cadastrar?type=cliente/pessoa_juridica'}>
                        <Box className={'item'}>
                          <Typography variant="subtitle2">{'Pessoa Jurídica'}</Typography>
                          <MdKeyboardArrowRight size={24} color={colors.white} />
                        </Box>
                      </Link>
                      <Link href={'/cadastrar?type=cliente/contador'}>
                        <Box className={'item'}>
                          <Typography variant="subtitle2">{'Contador'}</Typography>
                          <MdKeyboardArrowRight size={24} color={colors.white} />
                        </Box>
                      </Link>
                      <Link href={'/cadastrar?type=cliente/representante'}>
                        <Box className={'item'}>
                          <Typography variant="subtitle2">{'Representante Legal'}</Typography>
                          <MdKeyboardArrowRight size={24} color={colors.white} />
                        </Box>
                      </Link>
                    </Flex>
                  )}
                </SelectContainer>
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
                  customersListFiltered &&
                  customersListFiltered.map((customer: ICustomerProps) => ({
                    id: customer.id,
                    name: customer.attributes.name,
                    type:
                      customer.attributes.customer_type === 'physical_person'
                        ? 'Pessoa Física'
                        : customer.attributes.customer_type === 'legal_person'
                        ? 'Pessoa Jurídica'
                        : customer.attributes.customer_type === 'counter'
                        ? 'Contador'
                        : 'Representante Legal',
                    cpf:
                      (customer.attributes.cpf &&
                        customer.attributes.customer_type === 'physical_person') ||
                      customer.attributes.customer_type === 'counter'
                        ? cpfMask(customer.attributes.cpf)
                        : customer.attributes.cnpj &&
                          customer.attributes.customer_type === 'legal_person'
                        ? cnpjMask(customer.attributes.cnpj)
                        : '',
                    email: customer.attributes.default_email,
                    city: customer.attributes.city,
                    contact: customer.attributes.default_phone
                      ? phoneMask(customer.attributes.default_phone)
                      : '',
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
                    width: 200,
                    field: 'name',
                    headerName: 'Nome',
                    align: 'left',
                    headerAlign: 'left',
                  },
                  {
                    width: 180,
                    field: 'type',
                    headerName: 'Tipo',
                  },
                  {
                    width: 180,
                    field: 'cpf',
                    headerName: 'CPF/CNPJ',
                    sortable: false,
                  },
                  {
                    width: 250,
                    field: 'email',
                    headerName: 'E-mail',
                    sortable: false,
                  },
                  {
                    width: 140,
                    field: 'city',
                    headerName: 'Cidade',
                    sortable: false,
                  },
                  {
                    width: 180,
                    field: 'contact',
                    headerName: 'Contato',
                    sortable: false,
                  },
                ]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                localeText={{
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

export default withAuth(Customers);
