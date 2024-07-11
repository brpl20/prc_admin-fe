import React, { useEffect, useState, useContext } from 'react';

import { getAllTasks } from '@/services/tasks';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { ITaskProps, IAttributesProps } from '@/interfaces/ITask';

import {
  colors,
  PageTitle,
  DescriptionText,
  Input,
  Container,
  ContentContainer,
} from '@/styles/globals';

import { MdOutlineAddCircle, MdVisibility, MdModeEdit, MdSearch } from 'react-icons/md';

import { format } from 'date-fns';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { Footer, TaskModal, ViewDetailsModal } from '@/components';
import dynamic from 'next/dynamic';
import { getSession, useSession } from 'next-auth/react';
import { jwtDecode } from 'jwt-decode';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Tasks = () => {
  const { showTitle, setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenTaskModal, setOpenTaskModal] = useState(false);
  const [isOpenDetailsModal, setOpenDetailsModal] = useState(false);
  const [paramsRow, setParamsRow] = useState<IAttributesProps>();

  const [searchFor, setSearchFor] = useState<string>('description');
  const [tasksList, setTasksList] = useState<ITaskProps[]>([]);
  const [filteredTasksList, setFilteredTasksList] = useState<ITaskProps[]>([]);
  const [adminId, setAdminId] = useState<number>(0);

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const token: any = jwtDecode(session.token);
      if (token) {
        setAdminId(token.admin_id);
      }
    }
  }, [session]);

  const getRowClassName = (params: any) => {
    const status = params.row.status;

    if (status === 'Pendente') {
      return 'pending-row';
    } else if (status === 'Atrasado') {
      return 'late-row';
    } else {
      return 'completed-row';
    }
  };

  const handleCloseModal = () => {
    setOpenTaskModal(false);
    setOpenDetailsModal(false);
    if (paramsRow) {
      setParamsRow({} as IAttributesProps);
    }
  };

  const handleOpenToEdit = (task: IAttributesProps) => {
    setParamsRow(task);
    setOpenTaskModal(true);
  };

  const handleOpenToViewDetails = (task: IAttributesProps) => {
    setParamsRow(task);
    setOpenDetailsModal(true);
  };

  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');

    let filteredList = [];

    switch (searchFor) {
      case 'description':
        filteredList = tasksList.filter(task => regex.test(task.attributes.description));
        break;

      case 'customer':
        filteredList = tasksList.filter((task: any) => regex.test(task.attributes.customer));
        break;

      case 'work':
        filteredList = tasksList.filter((task: any) => regex.test(task.attributes.work_number));
        break;

      default:
        filteredList = [...tasksList];
        break;
    }

    setFilteredTasksList(filteredList);
  };

  useEffect(() => {
    setIsLoading(true);
    const getTasks = async () => {
      const response = await getAllTasks();
      setTasksList(response.data);
      setFilteredTasksList(response.data);
    };

    getTasks();
    setIsLoading(false);
  }, [isOpenTaskModal]);

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
      <Layout>
        {isOpenTaskModal ? (
          <TaskModal isOpen={isOpenTaskModal} onClose={handleCloseModal} dataToEdit={paramsRow} />
        ) : null}

        {isOpenDetailsModal && (
          <ViewDetailsModal
            isOpen={isOpenDetailsModal}
            onClose={handleCloseModal}
            details={paramsRow}
          />
        )}
        <Container>
          <PageTitle showTitle={showTitle}>{'Tarefas'}</PageTitle>

          <ContentContainer>
            <Box>
              <Typography mb={'8px'} variant="h6">
                {'Buscar Por'}
              </Typography>
              <Box display={'flex'} gap={'16px'} justifyContent={'space-between'}>
                <Box display={'flex'} gap={'16px'}>
                  <Box display={'flex'} gap={'16px'}>
                    <Button
                      onClick={() => setSearchFor('description')}
                      variant={searchFor === 'description' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Descrição'}
                    </Button>
                    <Button
                      value="type"
                      onClick={() => setSearchFor('customer')}
                      variant={searchFor === 'customer' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Cliente'}
                    </Button>
                    <Button
                      onClick={() => setSearchFor('work')}
                      variant={searchFor === 'work' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Trabalho'}
                    </Button>
                  </Box>
                  <Input>
                    <input
                      type="text"
                      placeholder="Buscar Tarefa"
                      onChange={e => handleSearch(e.target.value)}
                    />
                    <MdSearch size={25} />
                  </Input>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: colors.quartiary,
                    color: colors.white,
                    height: 36,
                    width: 180,
                    '&:hover': {
                      backgroundColor: colors.quartiaryHover,
                    },
                  }}
                  onClick={() => setOpenTaskModal(true)}
                >
                  <DescriptionText style={{ cursor: 'pointer' }} className="ml-8">
                    {'Nova Tarefa'}
                  </DescriptionText>
                  <MdOutlineAddCircle size={20} />
                </Button>
              </Box>
            </Box>
            <Box mt={'20px'} sx={{ height: 450 }}>
              <DataGrid
                disableColumnMenu
                loading={isLoading}
                disableRowSelectionOnClick
                slots={{
                  loadingOverlay: LinearProgress,
                }}
                rows={
                  filteredTasksList.length > 0
                    ? filteredTasksList.map(task => ({
                        id: task.id,
                        description: task.attributes.description,
                        work: task.attributes.work_number ? task.attributes.work_number : '-',
                        customer: task.attributes.customer,
                        responsible: task.attributes.responsible,
                        priority: task.attributes.priority,
                        comment: task.attributes.comment,
                        created_by_id: task.attributes.created_by_id,
                        deadline: format(new Date(task.attributes.deadline), 'dd MMMM yyyy'),
                        status:
                          task.attributes.status === 'pending'
                            ? 'Pendente'
                            : task.attributes.status === 'late'
                            ? 'Atrasado'
                            : 'Finalizado',
                      }))
                    : []
                }
                columns={[
                  {
                    width: 140,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
                    renderCell: (params: any) => (
                      <Box width={'100%'} display={'flex'} justifyContent={'space-around'}>
                        <MdVisibility
                          size={20}
                          cursor="pointer"
                          onClick={() => handleOpenToViewDetails(params.row)}
                        />
                        <button
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          disabled={params.row.created_by_id !== adminId}
                          onClick={() => {
                            handleOpenToEdit(params.row);
                          }}
                        >
                          <MdModeEdit size={22} color={colors.icons} cursor={'pointer'} />
                        </button>
                      </Box>
                    ),
                  },
                  {
                    width: 180,
                    field: 'description',
                    headerName: 'Descrição',
                  },
                  {
                    flex: 1,
                    field: 'customer',
                    headerName: 'Cliente',
                    sortable: false,
                  },
                  {
                    flex: 1,
                    field: 'work',
                    headerName: 'Trabalho',
                    align: 'center',
                    headerAlign: 'center',
                    sortable: false,
                  },
                  {
                    flex: 1,
                    field: 'deadline',
                    headerName: 'Data Limite',
                    sortable: false,
                  },
                  {
                    flex: 1,
                    field: 'status',
                    headerName: 'Status',
                    align: 'center',
                    headerAlign: 'center',
                    sortable: false,
                    renderCell: (params: any) => (
                      <div
                        className={`status-cell ${
                          params.value === 'Pendente'
                            ? 'pending'
                            : params.value === 'Atrasado'
                            ? 'late'
                            : 'completed'
                        }`}
                      >
                        {params.value}
                      </div>
                    ),
                  },
                ]}
                getRowClassName={getRowClassName}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                localeText={{
                  noRowsLabel: 'Nenhuma tarefa encontrada',
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

export default Tasks;

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
