import { Box, LinearProgress, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

interface PowerDataGridProps {
  loading: boolean;
  powersSelected: number[];
  filteredPowers: any[];
  setPowersSelected: (ids: number[]) => void;
}

export default function PowerDataGrid({
  loading,
  powersSelected,
  filteredPowers,
  setPowersSelected,
}: PowerDataGridProps) {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        disableColumnMenu
        checkboxSelection
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        rows={filteredPowers.map((item: any) => ({ id: item.id, description: item.description }))}
        columns={[{ flex: 1, field: 'description', headerName: 'Descrição', headerAlign: 'left' }]}
        getRowClassName={params =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
        }
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        localeText={{
          MuiTablePagination: {
            labelRowsPerPage: 'Linhas por página',
            labelDisplayedRows(paginationInfo) {
              return `${paginationInfo.from}- ${paginationInfo.to} de ${paginationInfo.count}`;
            },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        onRowSelectionModelChange={rowSelectionModel =>
          setPowersSelected(
            (rowSelectionModel as (string | number)[])
              .map(id => Number(id))
              .filter(id => !isNaN(id)),
          )
        }
        rowSelectionModel={powersSelected}
        slots={{
          noRowsOverlay: () =>
            loading ? (
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
              <Typography variant="h6">Nenhum Poder Encontrado</Typography>
            ),
        }}
      />
    </Box>
  );
}
