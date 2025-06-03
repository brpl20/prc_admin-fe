import React, { useEffect, useState, useContext } from 'react';

import { getAllTasks } from '@/services/tasks';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { ITaskProps, IAttributesProps } from '@/interfaces/ITask';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { restoreJob, inactiveJob } from '@/services/tasks';

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
  MdOutlineVisibility,
  MdOutlineCreate,
  MdOutlineArchive,
  MdDeleteOutline,
  MdOutlineUnarchive,
  MdSearch,
  MdMoreHoriz,
} from 'react-icons/md';
import IconButton from '@mui/material/IconButton';

import { format } from 'date-fns';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { Footer, TaskModal, ViewDetailsModal, DeleteModal, Notification } from '@/components';
import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
import { ptBR } from 'date-fns/locale';
import { defaultTableValueFormatter } from '../../utils/defaultTableValueFormatter';
import { filterTasksBySearch } from '@/utils/searchUtils';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Tasks = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);
  const [getForStatus, setGetForStatus] = useState<string>('active');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenTaskModal, setOpenTaskModal] = useState(false);
  const [isOpenDetailsModal, setOpenDetailsModal] = useState(false);
  const [paramsRow, setParamsRow] = useState<IAttributesProps>();
  const [refetch, setRefetch] = useState<boolean>(false);

  const [searchFor, setSearchFor] = useState<string>('description');
  const [tasksList, setTasksList] = useState<ITaskProps[]>([]);
  const [filteredTasksList, setFilteredTasksList] = useState<ITaskProps[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [rowItem, setRowItem] = useState<IAttributesProps>({} as IAttributesProps);

  const open = Boolean(anchorEl);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setMessage(message);
    setTypeMessage(type);
    setOpenSnackbar(true);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setRowItem({} as IAttributesProps);
  };

  const getRowClassName = (params: any) => {
    const status = params.row.status;

    if (status === 'Pendente') {
      return 'pending-row';
    } else if (status === 'Atrasado') {
      return 'delayed-row';
    } else {
      return 'finished-row';
    }
  };

  const handleCloseModal = () => {
    setOpenTaskModal(false);
    setOpenDetailsModal(false);
    if (paramsRow) {
      setParamsRow({} as IAttributesProps);
    }
  };

  const handleEdit = (task: IAttributesProps) => {
    setParamsRow(task);
    setOpenTaskModal(true);
  };

  const handleDetails = (task: IAttributesProps) => {
    setParamsRow(task);
    setOpenDetailsModal(true);
  };

  const handleRestore = async (task: IAttributesProps) => {
    try {
      await restoreJob(task.id);
      setMessage('Tarefa restaurada com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao restaurar tarefa');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleInactive = async (task: IAttributesProps) => {
    try {
      await inactiveJob(task.id);
      setMessage('Tarefa inativada com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao inativar tarefa');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (task: IAttributesProps) => {
    setRowItem(task);
    setOpenRemoveModal(true);
  };

  const handleSearch = (search: string) => {
    const filteredList = filterTasksBySearch(
      tasksList,
      search,
      searchFor as 'description' | 'customer' | 'work',
    );
    setFilteredTasksList(filteredList);
  };

  const getTasks = async () => {
    const requestParams = getForStatus === 'active' ? '' : getForStatus;

    const response = await getAllTasks(requestParams);
    setTasksList(response.data);
    setFilteredTasksList(response.data);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);

    getTasks();
  }, [refetch, isOpenTaskModal, getForStatus]);

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
        {isOpenTaskModal && (
          <TaskModal
            isOpen={isOpenTaskModal}
            onClose={handleCloseModal}
            dataToEdit={paramsRow}
            showMessage={showMessage}
          />
        )}

        {openSnackbar && (
          <Notification
            open={openSnackbar}
            message={message}
            severity={typeMessage}
            onClose={() => setOpenSnackbar(false)}
          />
        )}

        {isOpenDetailsModal && (
          <ViewDetailsModal
            isOpen={isOpenDetailsModal}
            onClose={handleCloseModal}
            details={paramsRow}
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
              ) : null}
            </div>
          </Menu>
        )}

        {openRemoveModal && (
          <DeleteModal
            isOpen={openRemoveModal}
            onClose={() => setOpenRemoveModal(false)}
            id={rowItem.id}
            entityName={rowItem.description}
            handleCloseModal={() => {
              setRefetch(!refetch);
              setOpenRemoveModal(false);
            }}
            model={'tarefa'}
          />
        )}

        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Tarefas'}</PageTitle>
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
                  className="gap-2"
                  sx={{
                    backgroundColor: colors.quartiary,
                    color: colors.white,
                    height: 36,
                    '&:hover': {
                      backgroundColor: colors.quartiaryHover,
                    },
                  }}
                  onClick={() => setOpenTaskModal(true)}
                >
                  <DescriptionText style={{ cursor: 'pointer' }}>{'Nova Tarefa'}</DescriptionText>
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
                sortModel={[{ field: 'id', sort: 'desc' }]}
                rows={
                  filteredTasksList.length > 0
                    ? filteredTasksList.map(task => ({
                        id: Number(task.id),
                        description: task.attributes.description,
                        deleted: task.attributes.deleted,
                        work: task.attributes.work_number ? task.attributes.work_number : '-',
                        customer:
                          task.attributes.customer && task.attributes.customer?.length > 2
                            ? task.attributes.customer
                            : '-',
                        responsible: task.attributes.responsible,
                        priority: task.attributes.priority,
                        comment: task.attributes.comment,
                        created_by_id: task.attributes.created_by_id,
                        deadline: format(new Date(task.attributes.deadline), 'dd MMMM yyyy', {
                          locale: ptBR,
                        }),
                        status:
                          task.attributes.status === 'pending'
                            ? 'Pendente'
                            : task.attributes.status === 'delayed'
                              ? 'Atrasado'
                              : 'Finalizado',
                      }))
                    : []
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
                    width: 180,
                    field: 'description',
                    headerName: 'Descrição',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    field: 'customer',
                    headerName: 'Cliente',
                    sortable: false,
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 150,
                    field: 'deadline',
                    headerName: 'Data Limite',
                    sortable: false,
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 150,
                    field: 'status',
                    headerName: 'Status',
                    align: 'center',
                    headerAlign: 'center',
                    sortable: false,
                    valueFormatter: defaultTableValueFormatter,
                    renderCell: (params: any) => (
                      <div
                        className={`status-cell ${
                          params.value === 'Pendente'
                            ? 'pending'
                            : params.value === 'Atrasado'
                              ? 'delayed'
                              : 'finished'
                        }`}
                      >
                        {params.value}
                      </div>
                    ),
                  },
                  {
                    width: 140,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
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

  if (session?.role === 'counter') {
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
