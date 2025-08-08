import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface FirstTimeSetupModalProps {
  open: boolean;
  onClose: () => void;
  onStartSetup: () => void;
}

const FirstTimeSetupModal: React.FC<FirstTimeSetupModalProps> = ({
  open,
  onClose,
  onStartSetup,
}) => {
  const router = useRouter();

  const features = [
    {
      icon: <GroupsIcon color="primary" />,
      title: 'Criar seu Time',
      description: 'Configure sua equipe jurídica com nome e descrição',
    },
    {
      icon: <PersonAddIcon color="primary" />,
      title: 'Convidar Membros',
      description: 'Adicione advogados, paralegais e outros colaboradores',
    },
    {
      icon: <BusinessIcon color="primary" />,
      title: 'Adicionar Escritórios',
      description: 'Registre os endereços dos seus escritórios',
    },
    {
      icon: <CheckCircleIcon color="primary" />,
      title: 'Começar a Trabalhar',
      description: 'Gerencie casos, documentos e clientes',
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Bem-vindo ao ProcStudio!
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Vamos configurar seu ambiente de trabalho em apenas alguns passos:
        </Typography>
        
        <Box mt={3}>
          <List>
            {features.map((feature, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>{feature.icon}</ListItemIcon>
                  <ListItemText
                    primary={feature.title}
                    secondary={feature.description}
                  />
                </ListItem>
                {index < features.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Box mt={3} p={2} bgcolor="primary.50" borderRadius={1}>
          <Typography variant="body2" color="primary.main">
            💡 Dica: Você pode pular etapas e configurá-las mais tarde nas configurações do time.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Configurar Mais Tarde
        </Button>
        <Button onClick={onStartSetup} variant="contained" size="large">
          Começar Configuração
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FirstTimeSetupModal;