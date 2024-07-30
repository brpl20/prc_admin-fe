import styles from './style.module.css';

import React, { useEffect, useState, useContext } from 'react';
import Router from 'next/router';
import Link from 'next/link';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import { getAllCustomers, getAllProfileCustomer, updateCustomer } from '@/services/customers';

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
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from 'react-icons/md';
import { BsFilterCircle } from 'react-icons/bs';

import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { Footer, Notification, Spinner } from '@/components';

import dynamic from 'next/dynamic';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

import { ICustomerProps } from '@/interfaces/ICustomer';
import { phoneMask } from '@/utils/masks';

import { CustomerContext } from '@/contexts/CustomerContext';
import { getSession } from 'next-auth/react';

export type CustomersProps = {
  id: string;
  email: '';
};

type TranslatedCustomer = {
  id: string;
  attributes: {
    [key: string]: any;
  };
};

type AllCustomer = {
  attributes: {
    email: string;
    profile_customer_id: number;
  };
};

const Customers = () => {
  const legend = [
    {
      id: 1,
      name: 'Pessoa Juridica',
      color: '#57a72160',
    },
    {
      id: 2,
      name: 'Pessoa Fisica',
      color: '#3281f75b',
    },
    {
      id: 3,
      name: 'Contador',
      color: '#fa9c0e8e',
    },
    {
      id: 4,
      name: 'Representante Legal',
      color: '#c9c9c92a',
    },
  ];

  const getRowClassName = (params: any) => {
    return params.row.type === 'Pessoa Fisica'
      ? styles.physicalPerson
      : params.row.type === 'Pessoa Juridica'
      ? styles.legalPerson
      : params.row.type === 'Contador'
      ? styles.counter
      : styles.representative;
  };

  const [loadingEmailChange, setLoadingEmailChange] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

  const { setCustomerForm } = useContext(CustomerContext);
  const { showTitle, setShowTitle } = useContext(PageTitleContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openCreationMenu, setOpenCreationMenu] = useState<boolean>(false);
  const [searchFor, setSearchFor] = useState<string>('name');
  const [profileCustomersList, setProfileCustomersList] = useState<ICustomerProps[]>([]);
  const [customerList, setCustomerList] = useState<ICustomerProps[]>([]);
  const [profileCustomersListFiltered, setProfileCustomersListFiltered] = useState<
    ICustomerProps[]
  >([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [customerToChange, setCustomerToChange] = useState<CustomersProps>();
  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');

    let filteredList = [];

    if (!profileCustomersList) {
      return;
    }

    switch (searchFor) {
      case 'name':
        filteredList = profileCustomersList.filter((profileCustomer: ICustomerProps) =>
          regex.test(profileCustomer.attributes.name),
        );
        break;

      case 'type':
        filteredList = profileCustomersList.filter((profileCustomer: ICustomerProps) =>
          regex.test(profileCustomer.attributes.customer_type),
        );
        break;

      case 'identification':
        filteredList = profileCustomersList.filter((profileCustomer: ICustomerProps) =>
          regex.test(profileCustomer.attributes.cpf),
        );
        break;

      default:
        filteredList = [...profileCustomersList];
        break;
    }

    setProfileCustomersListFiltered(filteredList);
  };

  const handleEdit = (profileCustomer: ICustomerProps) => {
    const customerTypeUnformatted = profileCustomer.type;
    const profileCustomerType =
      customerTypeUnformatted == 'Pessoa Fisica'
        ? 'physical_person'
        : customerTypeUnformatted == 'Pessoa Juridica'
        ? 'legal_person'
        : customerTypeUnformatted == 'Contador'
        ? 'counter'
        : 'representative';

    switch (profileCustomerType) {
      case 'physical_person':
        Router.push(`/alterar?type=cliente/pessoa_fisica&id=${profileCustomer.id}`);
        break;
      case 'legal_person':
        Router.push(`/alterar?type=cliente/pessoa_juridica&id=${profileCustomer.id}`);
        break;
      case 'counter':
        Router.push(`/alterar?type=cliente/contador&id=${profileCustomer.id}`);
        break;
      case 'representative':
        Router.push(`/alterar?type=cliente/representante&id=${profileCustomer.id}`);
        break;
      default:
        break;
    }
  };

  const handleDetails = (profileCustomer: ICustomerProps) => {
    const customerTypeUnformatted = profileCustomer.type;
    const profileCustomerType =
      customerTypeUnformatted == 'Pessoa Fisica'
        ? 'physical_person'
        : customerTypeUnformatted == 'Pessoa Juridica'
        ? 'legal_person'
        : customerTypeUnformatted == 'Contador'
        ? 'counter'
        : 'representative';

    switch (profileCustomerType) {
      case 'physical_person':
        Router.push(`/detalhes?type=cliente/pessoa_fisica&id=${profileCustomer.id}`);
        break;
      case 'legal_person':
        Router.push(`/detalhes?type=cliente/pessoa_juridica&id=${profileCustomer.id}`);
        break;
      case 'counter':
        Router.push(`/detalhes?type=cliente/contador&id=${profileCustomer.id}`);
        break;
      case 'representative':
        Router.push(`/detalhes?type=cliente/representante&id=${profileCustomer.id}`);
        break;
      default:
        break;
    }
  };

  const translateCustomerType = (profileCustomerType: string) => {
    switch (profileCustomerType) {
      case 'physical_person':
        return 'Pessoa Fisica';
      case 'legal_person':
        return 'Pessoa Juridica';
      case 'counter':
        return 'Contador';
      case 'representative':
        return 'Representante Legal';
      default:
        return profileCustomerType;
    }
  };

  const getProfileCustomers = async () => {
    const allProfileCustomer = await getAllProfileCustomer();
    const allCustomer = await getAllCustomers();

    setCustomerList(allCustomer.data);

    const translatedCustomers = allProfileCustomer.data.map((profileCustomer: ICustomerProps) => ({
      ...profileCustomer,
      attributes: {
        ...profileCustomer.attributes,
        customer_type: translateCustomerType(profileCustomer.attributes.customer_type),
      },
    }));

    translatedCustomers.forEach((translatedCustomer: TranslatedCustomer) => {
      const matchingCustomer = allCustomer.data.find(
        (customer: AllCustomer) =>
          customer.attributes.profile_customer_id === Number(translatedCustomer.id),
      );

      if (matchingCustomer) {
        translatedCustomer.attributes.customer_email = matchingCustomer.attributes.email;
      }
    });

    setProfileCustomersList(translatedCustomers);
    setProfileCustomersListFiltered(translatedCustomers);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);

    getProfileCustomers();
    setCustomerForm({});
  }, []);

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

  const handleProcessRowUpdate = (newRow: any, oldRow: any) => {
    const updatedRow = { ...oldRow, ...newRow };

    const customerId = customerList.find(
      customer => customer.attributes.profile_customer_id === Number(updatedRow.id),
    );

    if (oldRow.customer_email === updatedRow.customer_email) {
      return updatedRow;
    }

    if (customerId && customerId.id) {
      setCustomerToChange({
        id: customerId.id,
        email: updatedRow.customer_email,
      });
      setOpenModal(true);
    }

    return updatedRow;
  };

  const handleEmailChange = async () => {
    setLoadingEmailChange(true);

    try {
      if (!customerToChange) {
        throw new Error('Erro ao alterar e-mail');
      }

      await updateCustomer(customerToChange).finally(() => {
        setOpenModal(false);
        setMessage('E-mail alterado com sucesso!');
        setTypeMessage('success');
        setOpenSnackbar(true);

        setRefetch(!refetch);
      });

      getProfileCustomers();
    } catch (error: any) {
      const message = error[0].code[0] ? error[0].code[0] : 'Erro ao alterar e-mail';

      setMessage(message);
      setTypeMessage('error');
      setOpenSnackbar(true);
    }

    setLoadingEmailChange(false);
  };

  const orderByClick = (id: number) => {
    let filteredList = [];

    switch (id) {
      case 1:
        filteredList = profileCustomersList.filter(
          (profileCustomer: ICustomerProps) =>
            profileCustomer.attributes.customer_type === 'Pessoa Juridica',
        );
        break;
      case 2:
        filteredList = profileCustomersList.filter(
          (profileCustomer: ICustomerProps) =>
            profileCustomer.attributes.customer_type === 'Pessoa Fisica',
        );
        break;
      case 3:
        filteredList = profileCustomersList.filter(
          (profileCustomer: ICustomerProps) =>
            profileCustomer.attributes.customer_type === 'Contador',
        );
        break;
      case 4:
        filteredList = profileCustomersList.filter(
          (profileCustomer: ICustomerProps) =>
            profileCustomer.attributes.customer_type === 'Representante Legal',
        );
        break;
      default:
        filteredList = [...profileCustomersList];
        break;
    }

    setProfileCustomersListFiltered(filteredList);
  };

  return (
    <>
      {openModal && (
        <div
          className="relative z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3
                        className="text-base font-semibold leading-6 text-gray-900"
                        id="modal-title"
                      >
                        Alteração de E-mail
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {`Tem certeza que deseja alterar o endereço de e-mail? 
                      Um email de confirmação sera enviado ao cliente para que uma nova senha seja cadastrada.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    onClick={handleEmailChange}
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  >
                    <div className="w-[70px]">
                      {loadingEmailChange ? <Spinner className="text-white" /> : 'Alterar'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenModal(false);
                      setCustomerToChange({
                        id: '',
                        email: '',
                      });
                    }}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    <div className="w-[70px]">Cancelar</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={typeMessage}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

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
                          <Typography variant="subtitle2">{'Pessoa Fisica'}</Typography>
                          <MdKeyboardArrowRight size={24} color={colors.white} />
                        </Box>
                      </Link>
                      <Link href={'/cadastrar?type=cliente/pessoa_juridica'}>
                        <Box className={'item'}>
                          <Typography variant="subtitle2">{'Pessoa Juridica'}</Typography>
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
            {
              <div className="flex items-center mt-8 gap-[40px]">
                {legend.map((item, index) => (
                  <div
                    className="flex gap-[10px] cursor-pointer items-center"
                    key={index}
                    onClick={() => orderByClick(item.id)}
                  >
                    <Box
                      className="cursor-pointer w-[20px] h-[20px] rounded-[50%]"
                      sx={{
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography variant="subtitle2">{item.name}</Typography>
                  </div>
                ))}

                <div
                  className="flex gap-[10px] cursor-pointer items-center"
                  onClick={() => {
                    setProfileCustomersListFiltered(profileCustomersList);
                  }}
                >
                  <BsFilterCircle size={20} color="#a50000" />

                  <Typography variant="subtitle2">Listar Todos</Typography>
                </div>
              </div>
            }

            <Box mt={'20px'} sx={{ height: 450 }}>
              <DataGrid
                disableColumnMenu
                disableRowSelectionOnClick
                loading={isLoading}
                getRowClassName={getRowClassName}
                slots={{
                  loadingOverlay: LinearProgress,
                }}
                rows={
                  profileCustomersListFiltered &&
                  profileCustomersListFiltered.map((profileCustomer: ICustomerProps) => ({
                    id: profileCustomer.id,
                    name: profileCustomer.attributes.name,
                    type: profileCustomer.attributes.customer_type,
                    cpf:
                      (profileCustomer.attributes.cpf &&
                        profileCustomer.attributes.customer_type === 'Pessoa Fisica') ||
                      profileCustomer.attributes.customer_type === 'Contador' ||
                      profileCustomer.attributes.customer_type === 'Representante Legal'
                        ? profileCustomer.attributes.cpf
                        : profileCustomer.attributes.cnpj &&
                          profileCustomer.attributes.customer_type === 'Pessoa Juridica'
                        ? profileCustomer.attributes.cnpj
                        : '',
                    customer_email: profileCustomer.attributes.customer_email,
                    city: profileCustomer.attributes.city,
                    contact: profileCustomer.attributes.default_phone
                      ? phoneMask(profileCustomer.attributes.default_phone)
                      : '',
                  }))
                }
                columns={[
                  {
                    width: 150,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
                    sortable: false,
                    editable: false,
                    renderCell: (params: any) => (
                      <Box className="w-full flex justify-around">
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
                      </Box>
                    ),
                  },
                  {
                    width: 60,
                    field: 'id',
                    headerName: 'ID',
                    cellClassName: 'font-medium text-black',
                    align: 'center',
                    headerAlign: 'center',
                  },
                  {
                    width: 200,
                    field: 'name',
                    headerName: 'Nome',
                    cellClassName: 'font-medium text-black',
                    align: 'left',
                    headerAlign: 'left',
                  },
                  {
                    editable: true,
                    width: 250,
                    field: 'customer_email',
                    headerName: 'E-mail de Acesso',
                    cellClassName: 'font-medium text-black',
                    sortable: false,
                  },
                  {
                    width: 180,
                    field: 'type',
                    headerName: 'Tipo',
                    cellClassName: 'font-medium text-black',
                  },
                  {
                    width: 180,
                    field: 'cpf',
                    headerName: 'CPF/CNPJ',
                    cellClassName: 'font-medium text-black',
                    sortable: false,
                  },
                  {
                    width: 140,
                    field: 'city',
                    headerName: 'Cidade',
                    cellClassName: 'font-medium text-black',
                    sortable: false,
                  },
                  {
                    width: 180,
                    field: 'contact',
                    headerName: 'Contato',
                    cellClassName: 'font-medium text-black',
                    sortable: false,
                  },
                ]}
                processRowUpdate={handleProcessRowUpdate}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                localeText={{
                  noRowsLabel: 'Nenhum cliente encontrado',
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

export default Customers;

export const getServerSideProps = async (ctx: any) => {
  await getSession(ctx);

  return {
    props: {},
  };
};
