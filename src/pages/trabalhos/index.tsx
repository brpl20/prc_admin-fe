import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';

import { getAllWorks } from '@/services/works';
import { IWorksListProps } from '@/interfaces/IWork';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { WorkContext } from '@/contexts/WorkContext';
import { getAllAdmins } from '@/services/admins';

import { inactiveWork, restoreWork } from '@/services/works';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

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
  MdOutlineVisibility,
  MdOutlineCreate,
  MdMoreHoriz,
  MdDeleteOutline,
  MdOutlineArchive,
  MdOutlineUnarchive,
} from 'react-icons/md';
import { RxUpdate } from 'react-icons/rx';

import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { Footer, Notification, ModalOfRemove } from '@/components';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { IAdminProps } from '@/interfaces/IAdmin';
import { WorkStatusModal } from '@/components';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Works = () => {
  const { setWorkForm } = useContext(WorkContext);
  const { showTitle, setShowTitle } = useContext(PageTitleContext);

  const [refetch, setRefetch] = useState<boolean>(false);

  const [getForStatus, setGetForStatus] = useState<string>('active');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchFor, setSearchFor] = useState<string>('profile_customers');
  const [worksList, setWorksList] = useState<IWorksListProps[]>([]);
  const [worksListListFiltered, setWorksListFiltered] = useState<IWorksListProps[]>([]);
  const [allLawyers, SetAllLawyers] = useState<any>([]);
  const [statusModalisOpen, setStatusModalisOpen] = useState<boolean>(false);
  const [workId, setWorkId] = useState<string>('');
  const [workStatus, setWorkStatus] = useState<string>('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [rowItem, setRowItem] = useState<IWorksListProps>({} as IWorksListProps);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setRowItem({} as IWorksListProps);
  };

  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');

    let filteredWorks = worksList;

    if (search) {
      switch (searchFor) {
        case 'profile_customers':
          filteredWorks = worksList.filter((work: any) => {
            const clients_names = work.attributes.profile_customers.map(
              (customer: any) => customer.name,
            );
            return clients_names.some((name: string) => regex.test(name));
          });
          break;

        case 'procedure':
          filteredWorks = worksList.filter((work: any) => {
            const procedures = work.attributes.procedure
              ? mapProcedureName(work.attributes.procedure)
              : work.attributes.procedures.map(mapProcedureName);
            return procedures.some((procedure: string) => regex.test(procedure));
          });
          break;

        case 'requestProcess':
          filteredWorks = worksList.filter(
            (work: any) =>
              work.attributes.number !== null && regex.test(work.attributes.number.toString()),
          );
          break;

        default:
          break;
      }
    }

    setWorksListFiltered(filteredWorks);
  };

  const handleEdit = (work: IWorksListProps) => {
    setWorkForm(work);
    Router.push(`/alterar?type=trabalho&id=${work.id}`);
  };

  const handleDetails = (work: IWorksListProps) => {
    Router.push(`/detalhes?type=trabalho&id=${work.id}`);
  };

  const handleRestore = async (work: IWorksListProps) => {
    try {
      await restoreWork(work.id);
      setMessage('Trabalho restaurado com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao restaurar trabalho');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleInactive = async (work: IWorksListProps) => {
    try {
      await inactiveWork(work.id);
      setMessage('Trabalho inativado com sucesso!');
      setTypeMessage('success');
      setOpenSnackbar(true);
      setRefetch(!refetch);
    } catch (error: any) {
      setMessage('Erro ao inativar trabalho');
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (work: IWorksListProps) => {
    setRowItem(work);
    setOpenRemoveModal(true);
  };

  const handleStatus = (work: any) => {
    setStatusModalisOpen(true);
    setWorkId(work.id.toString());
    setWorkStatus(work.status);
  };

  const mapProcedureName = (procedure: string) => {
    const procedureMap: Record<string, string> = {
      administrative: 'Administrativo',
      judicial: 'Judicial',
      extrajudicial: 'Extrajudicial',
    };

    return procedureMap[procedure.toLowerCase()] || procedure;
  };

  const mapSubjectName = (subject: string) => {
    const subjectMap: Record<string, string> = {
      administrative_subject: 'Administrativo',
      civil: 'Civil',
      criminal: 'Criminal',
      social_security: 'Previdenciário',
      laborite: 'Trabalhista',
      tributary: 'Tributário',
      tributary_pis: 'Tributário PIS',
      others: 'Outros',
    };

    return subjectMap[subject.toLowerCase()] || subject;
  };

  const getAdmins = async () => {
    const response: {
      data: IAdminProps[];
    } = await getAllAdmins('');
    SetAllLawyers(response.data);
  };

  const getWorks = async () => {
    const requestParams = getForStatus === 'active' ? '' : getForStatus;

    const response = await getAllWorks(requestParams);
    setWorksList(response.data);
    setWorksListFiltered(response.data);
    setIsLoading(false);
  };

  const getLawyerName = (lawyerId: number) => {
    if (lawyerId) {
      const lawyer = allLawyers.find((lawyer: any) => lawyer.id == lawyerId);
      return lawyer && `${lawyer?.attributes.name} ${lawyer?.attributes.last_name}`;
    }
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  useEffect(() => {
    getAdmins();
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (window) {
      window.addEventListener('scroll', function () {
        const scrolled = window.scrollY;

        if (scrolled > 200) {
          //
        }
      });
    }

    getWorks();
    setWorkForm({});
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

  const handleCloseModal = async () => {
    setStatusModalisOpen(false);
    setWorkId('');
    setWorkStatus('');

    await getWorks();
  };

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

      {statusModalisOpen && (
        <WorkStatusModal
          isOpen={statusModalisOpen}
          onClose={handleCloseModal}
          workId={workId}
          workStatus={workStatus}
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
                    handleStatus(rowItem);
                  }}
                >
                  <RxUpdate size={22} color={colors.icons} cursor={'pointer'} />
                  <label className="font-medium	cursor-pointer">Atualizações</label>
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
        <ModalOfRemove
          isOpen={openRemoveModal}
          onClose={() => setOpenRemoveModal(false)}
          id={rowItem.id}
          textConfirmation={`tabalho/${rowItem.procedure}`}
          handleCloseModal={() => {
            setRefetch(!refetch);
            setOpenRemoveModal(false);
          }}
          model={'trabalho'}
        />
      )}

      <Layout>
        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Trabalhos'}</PageTitle>
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
                      onClick={() => setSearchFor('profile_customers')}
                      variant={searchFor === 'profile_customers' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        width: '100px',
                        textTransform: 'none',
                      }}
                    >
                      {'Cliente'}
                    </Button>

                    <Button
                      onClick={() => setSearchFor('procedure')}
                      variant={searchFor === 'procedure' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        textTransform: 'none',
                      }}
                    >
                      {'Procedimento'}
                    </Button>

                    <Button
                      onClick={() => setSearchFor('requestProcess')}
                      variant={searchFor === 'requestProcess' ? 'contained' : 'outlined'}
                      sx={{
                        height: '36px',
                        textTransform: 'none',
                      }}
                    >
                      {'Requerimento/Processo'}
                    </Button>
                  </Box>

                  <Input>
                    <input
                      type="text"
                      placeholder="Buscar Trabalho"
                      onChange={e => handleSearch(e.target.value)}
                    />
                    <MdSearch size={25} />
                  </Input>
                </Box>
                <Link href="/cadastrar?type=trabalho">
                  <Button
                    variant="contained"
                    color="primary"
                    className="gap-2"
                    sx={{
                      backgroundColor: colors.quartiary,
                      color: colors.white,
                      height: 36,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: colors.quartiaryHover,
                      },
                    }}
                  >
                    <DescriptionText style={{ cursor: 'pointer' }}>
                      {'Novo Trabalho'}
                    </DescriptionText>
                    <MdOutlineAddCircle size={20} />
                  </Button>
                </Link>
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
                  worksListListFiltered &&
                  worksListListFiltered.map((work: IWorksListProps) => {
                    const responsible = getLawyerName(work.attributes.responsible_lawyer);

                    const partner = getLawyerName(work.attributes.partner_lawyer);
                    const procedures = work.attributes.procedure
                      ? mapProcedureName(work.attributes.procedure)
                      : work.attributes.procedures.map(mapProcedureName);

                    const clients_names = work.attributes.profile_customers.map(
                      (customer: any) => customer.name,
                    );

                    const subject = work.attributes.subject
                      ? mapSubjectName(work.attributes.subject)
                      : work.attributes.subject;

                    return {
                      id: work.id,
                      client:
                        clients_names.length > 1
                          ? clients_names.map(getFirstName).join(', ')
                          : clients_names,
                      procedure: procedures,
                      deleted: work.attributes.deleted,
                      subject: subject,
                      requestProcess: work.attributes.number,
                      responsible: responsible,
                      partner: partner,
                      created_by_id: work.attributes.created_by_id,
                      status: work.attributes.status,
                    };
                  })
                }
                columns={[
                  {
                    width: 80,
                    field: 'id',
                    headerName: 'ID',
                    cellClassName: 'font-medium text-black',
                    align: 'center',
                    headerAlign: 'center',
                  },
                  {
                    flex: 1,
                    minWidth: 210,
                    field: 'client',
                    headerName: 'Cliente',
                  },
                  {
                    flex: 1,
                    minWidth: 200,
                    field: 'procedure',
                    headerName: 'Procedimento',
                  },
                  {
                    width: 120,
                    field: 'subject',
                    headerName: 'Assunto',
                  },
                  {
                    flex: 1,
                    field: 'responsible',
                    headerName: 'Responsável',
                  },
                  {
                    width: 100,
                    maxWidth: 100,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
                    editable: false,
                    renderCell: (params: any) => (
                      // <Box width={'100%'} display={'flex'} justifyContent={'space-around'}>
                      //   <MdVisibility
                      //     size={22}
                      //     color={colors.icons}
                      //     cursor={'pointer'}
                      //     onClick={() => handleDetails(params.row)}
                      //   />
                      //   <button
                      //     style={{
                      //       backgroundColor: 'transparent',
                      //       border: 'none',
                      //       cursor: 'pointer',
                      //     }}
                      //     disabled={params.row.created_by_id !== adminId}
                      //     onClick={() => {
                      //       handleEdit(params.row);
                      //     }}
                      //   >
                      //     <MdModeEdit size={22} color={colors.icons} cursor={'pointer'} />
                      //   </button>
                      //   <button
                      //     style={{
                      //       backgroundColor: 'transparent',
                      //       border: 'none',
                      //       cursor: 'pointer',
                      //     }}
                      //     disabled={params.row.created_by_id !== adminId}
                      //     onClick={() => {
                      //       handleStatus(params.row);
                      //     }}
                      //   >
                      //     <MdNoteAdd size={22} color={colors.icons} cursor={'pointer'} />
                      //   </button>
                      // </Box>
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
                  noRowsLabel: 'Nenhum trabalho encontrado',
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

export default Works;
