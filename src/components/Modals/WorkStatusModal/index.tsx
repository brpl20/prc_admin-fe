import {
  Box,
  Modal,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  CircularProgress,
} from '@mui/material';

import { Flex, colors } from '@/styles/globals';

import { MdClose } from 'react-icons/md';
import { Content } from './styles';
import { useState } from 'react';
import { z } from 'zod';
import { Notification } from '@/components';
import api from '@/services/api';

interface IWorkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workStatus: string;
}

interface FormData {
  description: string;
  status: string;
  date: string;
}

const statusSchema = z.object({
  description: z.string().min(3, { message: 'Descrição é obrigatória' }),
  status: z.string().min(3, { message: 'Status é obrigatório' }),
  date: z.string().min(3, { message: 'Data é obrigatória' }),
});

const WorkStatusModal = ({ isOpen, onClose, workId, workStatus }: IWorkStatusModalProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState({} as any);

  const [formData, setFormData] = useState<FormData>({
    description: '',
    status: workStatus,
    date: '',
  });

  const handleClose = () => {
    onClose();
  };

  const handleSelectChange = (field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [field as string]: value && value.id ? value.id : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      statusSchema.parse(formData);
      setLoading(true);

      const responseStatus = await api.put(`/works/${workId}`, {
        work: {
          status: formData.status,
        },
      });

      if (responseStatus.status === 200 || responseStatus.status === 201) {
        setMessage('Status atualizado com sucesso!');
        setType('success');
        setOpenSnackbar(true);
      }

      const response = await api.post(`/work_events`, {
        work_event: {
          date: formData.date,
          description: formData.description,
          work_id: workId,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setMessage('Status atualizado com sucesso!');
        setType('success');
        setOpenSnackbar(true);
        onClose();
      }
    } catch (error: any) {
      handleFormError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = (error: any) => {
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: { [key: string]: string } = {};
    setMessage('Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);

    for (const field in newErrors) {
      if (Object.prototype.hasOwnProperty.call(newErrors, field)) {
        errorObject[field] = newErrors[field][0] as string;
      }
    }
    setErrors(errorObject);
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
      <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
        <Content>
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            <label style={{ fontSize: '28px', color: '#01013D', fontWeight: '500' }}>
              {'Atualização do Trabalho'}
            </label>
            <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
              <MdClose size={26} onClick={handleClose} />
            </Box>
          </Box>
          <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

          {
            <Box
              sx={{
                height: '300px',
                overflow: 'auto',
                borderBottom: '1px solid #A8A8B3',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
              my={'16px'}
            >
              <Box>
                <Flex>
                  <Typography variant="h6">{'Status'}</Typography>
                </Flex>
                <RadioGroup
                  value={formData.status}
                  sx={{ flexDirection: 'row' }}
                  onChange={e => handleSelectChange('status', e.target.value)}
                >
                  <FormControlLabel
                    value="in_progress"
                    control={<Radio size="small" />}
                    label="Em andamento"
                  />
                  <FormControlLabel
                    value="paused"
                    control={<Radio size="small" />}
                    label="Pausado"
                  />
                  <FormControlLabel
                    value="completed"
                    control={<Radio size="small" />}
                    label="Finalizado"
                  />
                </RadioGroup>
              </Box>

              <Box>
                <Flex>
                  <Typography mb={'8px'} variant="h6">
                    {'Data da Movimentação'}
                  </Typography>
                </Flex>
                <input
                  type="date"
                  name="birth"
                  style={{
                    height: '40px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: `${errors.date ? '1px solid red' : '1px solid #A8A8B3'}`,
                    fontSize: '16px',
                    fontFamily: 'Roboto',
                    fontWeight: 400,
                  }}
                  onChange={e => handleSelectChange('date', e.target.value)}
                  value={formData.date}
                />
              </Box>

              <Box>
                <Flex style={{ flexDirection: 'column', flex: 1 }}>
                  <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                    {'Descrição'}
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    size="small"
                    autoComplete="off"
                    placeholder={`Informe a descrição`}
                    onChange={e => handleSelectChange('description', e.target.value)}
                    value={formData.description}
                    error={!!errors.description}
                  />
                </Flex>
              </Box>
            </Box>
          }

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
              onClick={() => {
                if (!loading) {
                  handleSubmit();
                }
              }}
              color="secondary"
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

export default WorkStatusModal;
