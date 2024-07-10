import React, { useState } from 'react';
import { Box, Modal, Button, Typography, Tooltip } from '@mui/material';
import { Content, Title, BoxContent } from './styles';
import { MdClose, MdOutlineContentCopy, MdOutlineCheck } from 'react-icons/md';
import { colors } from '@/styles/globals';

const ViewDetails = ({ isOpen, onClose, details }: any) => {
  const [copiedText, setCopiedText] = useState('');

  const handleCopyClick = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);

    setTimeout(() => {
      setCopiedText('');
    }, 2000);
  };

  const renderCopyIcon = (text: string) => {
    return copiedText === text && copiedText ? (
      <MdOutlineCheck size={16} color={colors.green} />
    ) : (
      <Tooltip title={'Copiar'}>
        <MdOutlineContentCopy
          size={16}
          cursor={'pointer'}
          color={colors.secondary}
          onClick={() => {
            handleCopyClick(text);
          }}
        />
      </Tooltip>
    );
  };

  const renderDetailRow = (label: string, value: string, isLongText = false) => {
    return (
      <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
        <Typography color={colors.black} variant="h6">
          {label}
        </Typography>
        <BoxContent>
          {value && (
            <>
              {isLongText ? (
                <Box style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  <Typography variant="subtitle1">{value}</Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="subtitle1">{value}</Typography>
                  {renderCopyIcon(value)}
                </>
              )}
            </>
          )}
        </BoxContent>
      </Box>
    );
  };

  return (
    <Modal open={isOpen} style={{ overflowY: 'auto' }}>
      <Content>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <label style={{ fontSize: '28px', color: '#2A3F54', fontWeight: '500' }}>
            {'Detalhes da Tarefa'}
          </label>
          <MdClose size={26} cursor="pointer" onClick={onClose} />
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Box width="48%">
            {renderDetailRow('Descrição', details.description)}
            {renderDetailRow('Cliente', details.customer)}
            {renderDetailRow('Responsável', details.responsible)}
            {renderDetailRow('Trabalho', details.work)}
          </Box>
          <Box width="48%">
            {renderDetailRow('Prazo de Entrega', details.deadline)}
            {renderDetailRow('Prioridade', details.priority)}
            {renderDetailRow('Status', details.status)}
          </Box>
        </Box>

        <Box mt={3}>
          <Typography variant="h6">{'Comentários'}</Typography>

          <BoxContent>
            {details.comment && (
              <>
                <Box style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  <Typography variant="subtitle1">{details.comment}</Typography>
                </Box>
              </>
            )}
          </BoxContent>
        </Box>

        <Box width="100%" display="flex" justifyContent="end" mt={3}>
          <Button
            color="primary"
            variant="outlined"
            sx={{
              width: '100px',
              height: '36px',
            }}
            onClick={onClose}
          >
            {'Fechar'}
          </Button>
        </Box>
      </Content>
    </Modal>
  );
};

export default ViewDetails;
