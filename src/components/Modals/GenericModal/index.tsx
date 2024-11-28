import { Box, Modal, Button, Typography } from '@mui/material';
import { colors } from '@/styles/globals';
import { MdClose } from 'react-icons/md';
import { Content } from './styles';

interface IGenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  content: React.ReactNode;
  showConfirmButton?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

const GenericModal = ({
  isOpen,
  onClose,
  onConfirm = onClose,
  title = 'Atenção!',
  content,
  showConfirmButton = false,
  cancelButtonText = 'Cancelar',
  confirmButtonText = 'Ok',
}: IGenericModalProps) => {
  return (
    <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
      <Content>
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <label style={{ fontSize: '28px', color: '#01013D', fontWeight: '500' }}>{title}</label>
          <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
            <MdClose size={26} onClick={onClose} />
          </Box>
        </Box>
        <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

        <Box mt={'10px'}>
          <>
            <Typography variant="subtitle1" className="leading-6">
              {content}
            </Typography>
          </>
        </Box>

        <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} mt={'40px'} />
        <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'10px'}>
          <Button
            color="primary"
            variant="outlined"
            sx={{
              width: '100px',
              height: '36px',
              textTransform: 'none',
            }}
            onClick={onClose}
          >
            {cancelButtonText}
          </Button>
          {showConfirmButton && (
            <Button
              variant="contained"
              sx={{
                minWidth: '124px',
                height: '36px',
                color: colors.white,
                textTransform: 'none',
                marginLeft: '16px',
              }}
              color="secondary"
              onClick={() => {
                onConfirm && onConfirm();
              }}
            >
              {confirmButtonText}
            </Button>
          )}
        </Box>
      </Content>
    </Modal>
  );
};

export default GenericModal;
