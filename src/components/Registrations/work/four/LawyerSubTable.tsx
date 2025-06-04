import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Box,
  Checkbox,
} from '@mui/material';
import { MdOutlineArrowDropUp, MdOutlineArrowDropDown } from 'react-icons/md';

interface LawyerSubTableProps {
  row: any;
  openSubTable: boolean;
  setOpenSubTable: (value: boolean) => void;
  selectedLawyers: number[];
  setSelectedLawyers: (value: number[]) => void;
}

export const LawyerSubTable = ({
  row,
  openSubTable,
  setOpenSubTable,
  selectedLawyers,
  setSelectedLawyers,
}: LawyerSubTableProps) => {
  const lawyers = row.attributes.lawyers;

  const handleSelectedLawyers = (lawyer: any) => {
    const lawyerId = lawyer.id;
    let updatedSelectedLawyers = [...selectedLawyers];

    if (updatedSelectedLawyers.includes(lawyerId)) {
      updatedSelectedLawyers = updatedSelectedLawyers.filter(id => id !== lawyerId);
    } else {
      updatedSelectedLawyers.push(lawyerId);
    }

    setSelectedLawyers(updatedSelectedLawyers);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpenSubTable(!openSubTable)}
          >
            {openSubTable ? <MdOutlineArrowDropUp /> : <MdOutlineArrowDropDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.attributes.name} {row.attributes.last_name}
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={openSubTable} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  {lawyers && lawyers.length > 0
                    ? lawyers.map((lawyer: any) => (
                        <TableRow key={lawyer.id}>
                          <TableCell padding="checkbox">
                            <Box display={'flex'}>
                              <Checkbox
                                color="primary"
                                checked={selectedLawyers.includes(lawyer.id)}
                                onChange={() => handleSelectedLawyers(lawyer)}
                                inputProps={{
                                  'aria-label': 'select all desserts',
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {lawyer.name || ''} {lawyer.last_name || ''}
                          </TableCell>
                        </TableRow>
                      ))
                    : []}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
