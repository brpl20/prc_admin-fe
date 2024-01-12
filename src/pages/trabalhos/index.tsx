import React, { useEffect, useState, useContext } from 'react';
import { withAuth } from '@/middleware/withAuth';
import Link from 'next/link';

import { getAllWorks } from '@/services/works';
import { IWorksListProps } from '@/interfaces/IWork';
import { PageTitleContext } from '@/contexts/PageTitleContext';
import { WorkContext } from '@/contexts/WorkContext';
import { getAllAdmins } from '@/services/admins';

import {
  colors,
  PageTitle,
  DescriptionText,
  Input,
  Container,
  ContentContainer,
} from '@/styles/globals';
import { MdOutlineAddCircle, MdSearch, MdVisibility, MdModeEdit, MdArchive } from 'react-icons/md';

import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { Footer } from '@/components';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { IAdminProps } from '@/interfaces/IAdmin';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Works = () => {
  const { setWorkForm } = useContext(WorkContext);
  const { showTitle, setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchFor, setSearchFor] = useState<string>('profile_customers');
  const [worksList, setWorksList] = useState<IWorksListProps[]>([]);
  const [worksListListFiltered, setWorksListFiltered] = useState<IWorksListProps[]>([]);
  const [allLawyers, SetAllLawyers] = useState<any>([]);

  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');

    let filteredWorks = worksList;

    if (search) {
      switch (searchFor) {
        case 'profile_customers':
          filteredWorks = worksList.filter((work: any) => {
            const customerData = work.relationships?.profile_customers.data;
            if (customerData) {
              return customerData.some((customer: any) => regex.test(customer.id));
            }
            return false;
          });
          break;

        case 'procedure':
          filteredWorks = worksList.filter((work: any) => regex.test(work.attributes.procedure));
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
    Router.push(`/alterar?type=trabalho&id=${work.id}`);
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
    } = await getAllAdmins();
    SetAllLawyers(response.data);
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

  const handleDetails = (work: IWorksListProps) => {
    Router.push(`/detalhes?type=trabalho&id=${work.id}`);
  };

  useEffect(() => {
    getAdmins();
  }, []);

  useEffect(() => {
    if (window) {
      window.addEventListener('scroll', function () {
        const scrolled = window.scrollY;

        if (scrolled > 200) {
          //
        }
      });
    }

    const getWorks = async () => {
      setIsLoading(true);
      const response = await getAllWorks();
      setWorksList(response.data);
      setWorksListFiltered(response.data);
      setIsLoading(false);
    };

    getWorks();
    setWorkForm({});
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
        setPageTitle('Trabalhos');
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
          <PageTitle showTitle={showTitle}>{'Trabalhos'}</PageTitle>

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
                    sx={{
                      backgroundColor: colors.quartiary,
                      color: colors.white,
                      height: 36,
                      width: 180,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: colors.quartiaryHover,
                      },
                    }}
                  >
                    <DescriptionText style={{ cursor: 'pointer' }} className="ml-8">
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
                      <Typography
                        variant="h6"
                        style={{
                          paddingLeft: '16px',
                        }}
                      >
                        {'Nenhum trabalho encontrado'}
                      </Typography>
                    ),
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
                      subject: subject,
                      requestProcess: work.attributes.number,
                      responsible: responsible,
                      partner: partner,
                    };
                  })
                }
                columns={[
                  {
                    width: 180,
                    field: 'actions',
                    headerName: 'Ações',
                    align: 'center',
                    headerAlign: 'center',
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
                        <MdArchive size={22} color={colors.icons} cursor={'pointer'} />
                      </Box>
                    ),
                  },
                  {
                    width: 300,
                    field: 'client',
                    headerName: 'Cliente',
                  },
                  {
                    width: 200,
                    field: 'procedure',
                    headerName: 'Procedimento',
                  },
                  {
                    width: 180,
                    field: 'subject',
                    headerName: 'Assunto',
                  },
                  {
                    width: 100,
                    field: 'action',
                    headerName: 'Ação',
                  },
                  {
                    width: 200,
                    field: 'requestProcess',
                    headerName: 'Requerimento/Processo',
                    align: 'center',
                    headerAlign: 'center',
                  },
                  {
                    width: 140,
                    field: 'responsible',
                    headerName: 'Responsável',
                  },
                  {
                    width: 140,
                    field: 'partner',
                    headerName: 'Parceiro',
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

export default withAuth(Works);
