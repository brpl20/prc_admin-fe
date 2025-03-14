import dynamic from 'next/dynamic';
import { DataGrid } from '@mui/x-data-grid';
import { useContext, useEffect, useState } from 'react';
import { getAllWorks } from '../../services/works';
import { IWorksListProps } from '../../interfaces/IWork';
import {
  colors,
  Container,
  ContentContainer,
  DescriptionText,
  Input,
  PageTitle,
} from '../../styles/globals';
import { Box, Button, IconButton, LinearProgress, Typography } from '@mui/material';
import { defaultTableValueFormatter } from '../../utils/defaultTableValueFormatter';
import { IAdminProps } from '../../interfaces/IAdmin';
import { getAllAdmins } from '../../services/admins';
import { PageTitleContext } from '../../contexts/PageTitleContext';
import { Footer } from '../../components';
import { MdOutlineAddCircle, MdSearch } from 'react-icons/md';
import { GrDocumentText } from 'react-icons/gr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useModal } from '@/utils/useModal';
import GenericModal from '@/components/Modals/GenericModal';
import dayjs from 'dayjs';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Documents = () => {
  const router = useRouter();
  const { showTitle, setShowTitle } = useContext(PageTitleContext);

  const [works, setWorks] = useState<IWorksListProps[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<IWorksListProps[]>([]);

  const [responsibleLawyers, setResponsibleLawyers] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  const invalidRequestModal = useModal();

  useEffect(() => {
    setIsLoading(true);

    fetchWorks();
  }, []);

  useEffect(() => {
    // Fetch responsible laywers
    fetchResponsibleLawyers();

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

  const fetchWorks = async () => {
    setIsLoading(true);

    try {
      const response = await getAllWorks('active');
      const worksWithDocuments = response.data.filter((work: IWorksListProps) => {
        return work.attributes.documents && work.attributes.documents.length > 0;
      });

      setWorks(worksWithDocuments);
      setFilteredWorks(worksWithDocuments);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponsibleLawyers = async () => {
    const response: {
      data: IAdminProps[];
    } = await getAllAdmins('');
    setResponsibleLawyers(response.data);
  };

  const getLawyerName = (lawyerId: number) => {
    if (lawyerId) {
      const lawyer = responsibleLawyers.find((lawyer: any) => lawyer.id == lawyerId);
      return lawyer && `${lawyer?.attributes.name} ${lawyer?.attributes.last_name}`;
    }
  };

  const handleSearch = (search: string) => {
    const regex = new RegExp(search, 'i');
    let filteredWorks = works;

    if (search) {
      filteredWorks = filteredWorks.filter((work: IWorksListProps) => {
        const clientsNames = work.attributes.profile_customers.map(
          (customer: any) => customer.name,
        );
        return clientsNames.some((name: string) => regex.test(name));
      });
    }

    setFilteredWorks(filteredWorks);
  };

  const handleOpenWorkDocuments = (params: any) => {
    const { id, client, responsible } = params.row;

    if (!client || !id) {
      invalidRequestModal.open();
      return;
    }

    // Redirect to signing and approval page
    router.push({
      pathname: '/documentos/aprovacao',
      query: {
        id: id,
        client: client,
        responsible: responsible,
      },
    });
  };

  return (
    <>
      <GenericModal
        isOpen={invalidRequestModal.isOpen}
        onClose={invalidRequestModal.close}
        title="Erro!"
        content="O trabalho selecionado não possui um cliente ou ID válido."
        cancelButtonText="Fechar"
      />
      <Layout>
        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Revisão e Aprovação de Documentos'}</PageTitle>
          </div>
          <ContentContainer>
            <Box>
              <Typography mb={'8px'} variant="h6">
                {'Buscar Por Cliente'}
              </Typography>
              <Box display={'flex'} gap={'16px'} justifyContent={'space-between'}>
                <Box display={'flex'} gap={'16px'}>
                  <Input>
                    <input
                      type="text"
                      placeholder="Nome do Cliente"
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
                  filteredWorks &&
                  filteredWorks.map((work: IWorksListProps) => {
                    const responsible = getLawyerName(work.attributes.responsible_lawyer);

                    const clients_names = work.attributes.profile_customers.map(
                      (customer: any) => customer.name,
                    );

                    return {
                      id: work.id,
                      client:
                        clients_names.length > 1
                          ? clients_names.map((name: string) => name.split(' ')[0]).join(', ')
                          : clients_names,
                      deleted: work.attributes.deleted,
                      responsible: responsible,
                      documents: work.attributes.documents,
                      number: work.attributes.number,
                      created_by_id: work.attributes.created_by_id,
                      date: work.attributes.created_at_date,
                    };
                  })
                }
                columns={[
                  {
                    flex: 2,
                    field: 'client',
                    headerName: 'Cliente',
                    align: 'center',
                    headerAlign: 'center',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 2,
                    field: 'responsible',
                    headerName: 'Responsável',
                    align: 'center',
                    headerAlign: 'center',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    field: 'number',
                    headerName: 'Nº do trabalho',
                    align: 'center',
                    headerAlign: 'center',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    field: 'date',
                    renderHeader: () => (
                      <div className="font-medium text-black text-center text-wrap leading-5">
                        {'Data de criação do trabalho'}
                      </div>
                    ),
                    headerAlign: 'center',
                    align: 'center',
                    valueFormatter: params => dayjs(params.value).format('DD/MM/YYYY'),
                    sortComparator: (v1, v2) => {
                      if (!v1) return 1;
                      if (!v2) return -1;
                      return dayjs(v1).unix() - dayjs(v2).unix();
                    },
                  },
                  {
                    flex: 1,
                    field: 'open_docs',
                    align: 'center',
                    editable: false,
                    headerAlign: 'center',
                    headerName: 'Abrir Documentação',
                    valueFormatter: defaultTableValueFormatter,
                    renderCell: (params: any) => (
                      <div>
                        <IconButton
                          aria-label="open"
                          onClick={() => handleOpenWorkDocuments(params)}
                        >
                          <GrDocumentText size={22} color={colors.icons} cursor={'pointer'} />
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

export default Documents;
