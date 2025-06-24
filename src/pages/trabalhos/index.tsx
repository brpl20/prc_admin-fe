import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';

import { getAllWorks } from '@/services/works';
import { IWorksListProps } from '@/interfaces/IWork';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { WorkContext } from '@/contexts/WorkContext';
import { getAllProfileAdmins } from '@/services/admins';

import { inactiveWork, restoreWork } from '@/services/works';
import { getAllCustomers, getAllProfileCustomer } from '@/services/customers';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { ICustomer, IProfileCustomer } from '@/interfaces/ICustomer';

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

import { Footer, Notification, DeleteModal } from '@/components';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { IProfileAdmin } from '@/interfaces/IAdmin';
import { WorkStatusModal } from '@/components';
import { defaultTableValueFormatter } from '../../utils/defaultTableValueFormatter';
import { translateCustomerType } from '@/utils/translateCustomerType';
import GenericModal from '@/components/Modals/GenericModal';
import { useModal } from '@/utils/useModal';
import { searchWorks } from '@/utils/searchUtils';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

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

const Works = () => {
  const { setWorkForm } = useContext(WorkContext);
  const { showTitle, setShowTitle } = useContext(PageTitleContext);

  const inactivationModal = useModal();
  const [workToInactivate, setWorkToInactivate] = useState<IWorksListProps>();

  const [refetch, setRefetch] = useState<boolean>(false);

  const [getForStatus, setGetForStatus] = useState<string>('active');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchFor, setSearchFor] = useState<'profile_customers' | 'procedure' | 'requestProcess'>(
    'profile_customers',
  );
  const [worksList, setWorksList] = useState<IWorksListProps[]>([]);
  const [worksListListFiltered, setWorksListFiltered] = useState<IWorksListProps[]>([]);
  const [allLawyers, SetAllLawyers] = useState<any>([]);
  const [statusModalisOpen, setStatusModalisOpen] = useState<boolean>(false);
  const [workId, setWorkId] = useState<string>('');
  const [workStatus, setWorkStatus] = useState<string>('');

  const [profileCustomersList, setProfileCustomersList] = useState<IProfileCustomer[]>([]);

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
    const filteredWorks = searchWorks(
      worksList,
      profileCustomersList,
      search,
      searchFor,
      mapProcedureName,
    );
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
      setMessage(error.response?.data?.error || 'Erro ao inativar trabalho');
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
      data: IProfileAdmin[];
    } = await getAllProfileAdmins('');
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
    getProfileCustomers();
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

  const getProfileCustomers = async () => {
    const allProfileCustomer = await getAllProfileCustomer('active');
    const allCustomer = await getAllCustomers();

    const translatedCustomers = allProfileCustomer.data.map(
      (profileCustomer: IProfileCustomer) => ({
        ...profileCustomer,
        attributes: {
          ...profileCustomer.attributes,
          customer_type: translateCustomerType(profileCustomer.attributes.customer_type),
        },
      }),
    );

    translatedCustomers.forEach((translatedCustomer: TranslatedCustomer) => {
      const matchingCustomer = allCustomer.data.find(
        (customer: ICustomer) =>
          customer.attributes.profile_customer_id &&
          customer.attributes.profile_customer_id === translatedCustomer.id,
      );

      if (matchingCustomer) {
        translatedCustomer.attributes.access_email = matchingCustomer.attributes.access_email;
      }
    });

    setProfileCustomersList(translatedCustomers);
    setIsLoading(false);
  };

  return (
    <>
      {/* Inactivation Modal */}
      <GenericModal
        isOpen={inactivationModal.isOpen}
        onClose={inactivationModal.close}
        onConfirm={async () => {
          handleInactive(workToInactivate!);
          inactivationModal.close();
        }}
        content={'Tem certeza de que deseja inativar esse trabalho?'}
        confirmButtonText="Sim, Inativar"
        showConfirmButton
      />

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
                    setWorkToInactivate(rowItem);
                    inactivationModal.open();
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
          entityName={rowItem.procedure}
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
                        textTransform: 'none',
                      }}
                      className="h-[36px] text-nowrap"
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

                    const clients_names = work.attributes.profile_customers.map((customer: any) => {
                      const profileCustomer = profileCustomersList.find(
                        (profileCustomer: any) => Number(profileCustomer.id) === customer.id,
                      );

                      const customerName = profileCustomer
                        ? `${profileCustomer.attributes.name ?? ''} ${profileCustomer.attributes.last_name ?? ''}`
                        : customer.name;

                      return customerName;
                    });

                    const subject = work.attributes.subject
                      ? mapSubjectName(work.attributes.subject)
                      : work.attributes.subject;

                    return {
                      id: Number(work.id),
                      client: clients_names.map((name: string) => name.split(', ')).join(', '),
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
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    minWidth: 210,
                    field: 'client',
                    headerName: 'Cliente',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    minWidth: 200,
                    field: 'procedure',
                    headerName: 'Procedimento',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 120,
                    field: 'subject',
                    headerName: 'Assunto',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    field: 'responsible',
                    headerName: 'Responsável',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    width: 100,
                    maxWidth: 100,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
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
