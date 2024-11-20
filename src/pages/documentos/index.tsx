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
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { defaultTableValueFormatter } from '../../utils/defaultTableValueFormatter';
import { IAdminProps } from '../../interfaces/IAdmin';
import { getAllAdmins } from '../../services/admins';
import { PageTitleContext } from '../../contexts/PageTitleContext';
import { Footer } from '../../components';
import { MdOutlineAddCircle, MdSearch } from 'react-icons/md';
import Link from 'next/link';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

type DocumentSearchFilter = 'pending_review' | 'pending_signature' | 'signed';

const Documents = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);

  const [works, setWorks] = useState<IWorksListProps[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<IWorksListProps[]>([]);

  const [responsibleLawyers, setResponsibleLawyers] = useState<any>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const [searchFor, setSearchFor] = useState<DocumentSearchFilter>('pending_review');

  useEffect(() => {
    setIsLoading(true);

    fetchWorks();
  }, [refetch]);

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
    const response = await getAllWorks('active');
    setWorks(response.data);
    setFilteredWorks(response.data);
    setIsLoading(false);
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

  return (
    <>
      <Layout>
        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Revisão e Aprovação de Documentos'}</PageTitle>
          </div>
          <ContentContainer>
            <Box>
              <Typography mb={'8px'} variant="h6">
                {'Buscar Por'}
              </Typography>
              <Box display={'flex'} gap={'16px'} justifyContent={'space-between'}>
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

                    const partner = getLawyerName(work.attributes.partner_lawyer);

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
                      requestProcess: work.attributes.number,
                      responsible: responsible,
                      partner: partner,
                      number: work.attributes.number,
                      created_by_id: work.attributes.created_by_id,
                      status: work.attributes.status,
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
                    cellClassName: 'font-medium text-black',
                    align: 'center',
                    headerAlign: 'center',
                    valueFormatter: defaultTableValueFormatter,
                  },
                  {
                    flex: 1,
                    field: 'open_docs',
                    align: 'center',
                    headerAlign: 'center',
                    headerName: 'Abrir Documentação',
                    valueFormatter: defaultTableValueFormatter,
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
