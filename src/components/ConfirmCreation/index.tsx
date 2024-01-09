import React, { ChangeEvent, useEffect, useState } from 'react';

import { Box, Modal, Button, Typography, TextField, CircularProgress } from '@mui/material';
import { IModalProps } from '@/interfaces/IFinalizeRegistration';

import { colors, Flex } from '@/styles/globals';

import { MdClose, MdOutlineInfo } from 'react-icons/md';
import CustomTooltip from '../Tooltip';
import { Content, Title, InputContainer, Input } from './styles';

import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

const ConfirmCreation = ({ isOpen, onClose, isLoading, handleSave, editMode }: IModalProps) => {
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

  useEffect(() => {
    if (editMode) {
      setTypeRegistration('edição');
    } else {
      setTypeRegistration('cadastro');
    }
  }, [editMode]);

  return (
    <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
      <Content>
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Title style={{ fontSize: '28px' }}>{'Confirmação'}</Title>
          <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
            <MdClose size={26} />
          </Box>
        </Box>
        <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

        <Box mt={'20px'}>
          <Typography variant="subtitle1">
            {`Você tem certeza que deseja finalizar ${editMode ? 'a' : 'o'} ${typeRegistration}?`}
          </Typography>
          {/* <Typography variant="subtitle1">
            {
              'Gostaria de salvar essas informações para facilitar lançamentos futuros?'
            }
          </Typography> */}

          {/* <Box mt={'8px'} mb={'8px'}>
            <IOSSwitch checked={isSwitchOn} onChange={handleSwitchChange} />
          </Box> */}

          <InputContainer showInput={isSwitchOn}>
            <Box mt={'16px'}>
              <Flex
                style={{
                  marginBottom: '8px',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">{'Título do Trabalho'}</Typography>
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
              </Flex>
              <Input>
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  size="small"
                  autoComplete="off"
                  onChange={handleInputChange}
                  placeholder="Informe o título do trabalho"
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
              handleSave(inputValue);
            }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: colors.white }} /> : 'Salvar'}
          </Button>
        </Box>
      </Content>
    </Modal>
  );
};

export default ConfirmCreation;
