import { Box, IconButton } from '@mui/material';
import { IDocumentApprovalProps } from '../../../../../interfaces/IDocument';
import { documentTypeToReadable } from '../../../../../utils/constants';
import { openFileInNewTab } from '../../../../../utils/files';
import { GrDocumentText } from 'react-icons/gr';
import { colors } from '../../../../../styles/globals';
import { DataGrid } from '@mui/x-data-grid';

interface TraditionalSignatureProps {
  documents: IDocumentApprovalProps[];
}

const TraditionalSignature: React.FunctionComponent<TraditionalSignatureProps> = ({
  documents,
}) => {
  return <Box className="mt-5"></Box>;
};

export default TraditionalSignature;
