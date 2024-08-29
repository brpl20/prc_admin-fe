import React, { ChangeEvent, useEffect, useState } from 'react';

import {
  Box,
  Modal,
  Button,
  Typography,
  TextField,
  CircularProgress,
  SwitchProps,
  Switch,
} from '@mui/material';
import { IModalProps } from '@/interfaces/IFinalizeRegistration';
import { Notification } from '@/components';

import { colors } from '@/styles/globals';

import { MdClose, MdOutlineInfo } from 'react-icons/md';
import CustomTooltip from '../../Tooltip';
import { Content, InputContainer, Input } from './styles';

import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#006582' : '#006582',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#006582',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

const ConfirmCreation = ({ isOpen, onClose, isLoading, handleSave, editMode }: IModalProps) => {
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [typeRegistration, setTypeRegistration] = useState('' as string);
  const router = useRouter();

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsSwitchOn(event.target.checked);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    if (isSwitchOn && !inputValue) {
      setMessage('Informe o título do trabalho');
      setOpenSnackbar(true);
      setType('error');
      return;
    }

    handleSave(inputValue);
  };

  useEffect(() => {
    if (editMode) {
      setTypeRegistration('edição');
    } else {
      setTypeRegistration('cadastro');
    }
  }, [editMode]);

  return (
    <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
      <>
        {openSnackbar && (
          <Notification
            open={openSnackbar}
            message={message}
            severity={type}
            onClose={() => setOpenSnackbar(false)}
          />
        )}
        <Content>
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            <label style={{ fontSize: '28px', color: '#2A3F54', fontWeight: '500' }}>
              {`${editMode ? 'Finalizar Edição' : 'Finalizar Cadastro'}`}
            </label>
            <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
              <MdClose size={26} />
            </Box>
          </Box>
          <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

          <Box mt={'20px'}>
            {router.asPath.includes('trabalho') && router.asPath.includes('cadastrar') ? (
              <>
                <Typography variant="subtitle1">
                  {'Gostaria de salvar essas informações para facilitar lançamentos futuros?'}
                </Typography>

                <Box mt={'8px'} mb={'8px'}>
                  <IOSSwitch checked={isSwitchOn} onChange={handleSwitchChange} />
                </Box>
              </>
            ) : (
              <>
                <Typography variant="subtitle1">{`Você tem certeza que deseja finalizar ${
                  editMode ? 'a' : 'o'
                } ${typeRegistration}?`}</Typography>
              </>
            )}

            <InputContainer showInput={isSwitchOn}>
              <Box mt={'16px'}>
                <div
                  style={{
                    display: 'flex',
                    marginBottom: '8px',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{
                      color: colors.primary,
                    }}
                  >
                    {'Título do Trabalho'}
                  </Typography>
                  <CustomTooltip
                    title="Este título será exibido no início do formulário como pré-definições e pode ser selecionado para alterar as informações deste novo trabalho."
                    placement="right"
                  >
                    <span
                      aria-label="Título do Trabalho"
                      style={{
                        display: 'flex',
                      }}
                    >
                      <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
                    </span>
                  </CustomTooltip>
                </div>
                <Input
                  style={{
                    border: 'none',
                    outline: 'none',
                  }}
                >
                  <TextField
                    id="outlined-basic"
                    autoComplete="off"
                    onChange={handleInputChange}
                    placeholder="Informe o título do trabalho"
                    style={{ width: '100%', outline: 'none' }}
                  />
                </Input>
              </Box>
            </InputContainer>
          </Box>

          <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'20px'}>
            <Button
              color="primary"
              variant="outlined"
              sx={{
                width: '100px',
                height: '36px',
              }}
              onClick={onClose}
            >
              {'Cancelar'}
            </Button>
            <Button
              variant="contained"
              sx={{
                width: '100px',
                height: '36px',
                color: colors.white,
                textTransform: 'none',
                marginLeft: '16px',
              }}
              color="secondary"
              onClick={() => {
                handleSubmit();
              }}
            >
              {isLoading ? <CircularProgress size={20} sx={{ color: colors.white }} /> : 'Salvar'}
            </Button>
          </Box>
        </Content>
      </>
    </Modal>
  );
};

export default ConfirmCreation;
