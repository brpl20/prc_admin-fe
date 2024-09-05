import { Box, Modal, TextField, Typography, Button, CircularProgress } from '@mui/material';
import { Flex, colors } from '@/styles/globals';

import { MdClose } from 'react-icons/md';

import { Content, Input, Title } from '../styles';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Notification } from '@/components';

interface IOfficeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleSave: (description: string) => void;
}

interface FormData {
  office_type: string;
}

const OfficeTypeModal = ({ isOpen, onClose, handleSave }: IOfficeTypeModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    office_type: '',
  });

  const router = useRouter();

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      office_type: '',
    });
  };

  const handleSubmit = () => {
    setLoading(true);

    if (!formData.office_type) {
      setMessage('Informe o Nome do Tipo de Escritório');
      setType('error');
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }

    try {
      handleSave(formData.office_type);
      resetForm();
    } catch (error: any) {
      if (error.response.status === 422) {
        setMessage('Tipo de Escritório já existe!');
        setType('error');
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      setMessage(error.message);
      setType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={type}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      <Modal open={isOpen} style={{ overflowY: 'auto' }}>
        <Content>
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            <label style={{ fontSize: '28px', color: '#2A3F54', fontWeight: '500' }}>
              Novo Tipo de Escritório
            </label>
            <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
              <MdClose size={26} />
            </Box>
          </Box>

          <Flex className="inputContainer">
            <Typography variant="h6" sx={{ marginBottom: '6px', color: '#2A3F54' }}>
              {'Tipo de Escritório'}
            </Typography>
            <Input>
              <TextField
                id="outlined-basic"
                variant="outlined"
                autoComplete="off"
                size="small"
                placeholder="Informe o Tipo de Escritório"
                value={formData.office_type}
                onChange={e => setFormData({ ...formData, office_type: e.target.value })}
              />
            </Input>
          </Flex>

          <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'16px'}>
            <Button
              color="primary"
              variant="outlined"
              sx={{
                width: '100px',
                height: '36px',
              }}
              onClick={() => {
                onClose();
                resetForm();
              }}
            >
              {'Cancelar'}
            </Button>
            <Button
              variant="contained"
              sx={{
                width: '100px',
                height: '36px',
                color: colors.white,
                marginLeft: '16px',
              }}
              color="secondary"
              onClick={() => {
                if (!loading) {
                  handleSubmit();
                }
              }}
            >
              {loading ? (
                <CircularProgress
                  size={20}
                  style={{
                    color: colors.white,
                  }}
                />
              ) : (
                'Salvar'
              )}
            </Button>
          </Box>
        </Content>
      </Modal>
    </>
  );
};

export default OfficeTypeModal;
