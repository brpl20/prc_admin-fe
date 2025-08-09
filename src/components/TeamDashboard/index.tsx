import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Alert,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Groups as GroupsIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useRouter } from 'next/router';
import teamService from '@/services/teams';
import { ITeam, ISubscription, ITeamMember } from '@/interfaces/ITeam';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  status: string;
}

interface Office {
  id: string;
  name: string;
  address: string;
  members: TeamMember[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  status: string;
}

interface Column {
  id: string;
  title: string;
  items: (TeamMember | Office | SubscriptionPlan)[];
}

const TeamDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'team',
      title: 'Time & Escritórios',
      items: []
    },
    {
      id: 'people',
      title: 'Todas as Pessoas',
      items: []
    },
    {
      id: 'subscriptions',
      title: 'Planos de Assinatura',
      items: [
        {
          id: 'basic',
          name: 'Plano Básico',
          price: 'R$ 99/mês',
          features: ['5 usuários', '2 escritórios', '100 casos'],
          status: 'available'
        },
        {
          id: 'professional',
          name: 'Plano Profissional',
          price: 'R$ 199/mês',
          features: ['15 usuários', '5 escritórios', '500 casos'],
          status: 'popular'
        },
        {
          id: 'enterprise',
          name: 'Plano Enterprise',
          price: 'R$ 399/mês',
          features: ['Usuários ilimitados', 'Escritórios ilimitados', 'Casos ilimitados'],
          status: 'premium'
        }
      ]
    }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simular dados do time
      const mockTeamMembers: TeamMember[] = [
        { id: 'tm1', name: 'João Silva', role: 'Advogado', email: 'joao@email.com', status: 'active' },
        { id: 'tm2', name: 'Maria Santos', role: 'Paralegal', email: 'maria@email.com', status: 'active' },
        { id: 'tm3', name: 'Pedro Costa', role: 'Estagiário', email: 'pedro@email.com', status: 'invited' },
      ];

      const mockOffices: Office[] = [
        { 
          id: 'of1', 
          name: 'Escritório Principal', 
          address: 'Rua das Flores, 123', 
          members: [mockTeamMembers[0]] 
        },
        { 
          id: 'of2', 
          name: 'Filial São Paulo', 
          address: 'Av. Paulista, 456', 
          members: [] 
        },
      ];

      const mockAllPeople: TeamMember[] = [
        { id: 'ap1', name: 'Ana Lima', role: 'Advogada', email: 'ana@email.com', status: 'available' },
        { id: 'ap2', name: 'Carlos Oliveira', role: 'Contador', email: 'carlos@email.com', status: 'available' },
        { id: 'ap3', name: 'Fernanda Rocha', role: 'Secretária', email: 'fernanda@email.com', status: 'available' },
      ];

      setColumns(prev => [
        {
          ...prev[0],
          items: [...mockTeamMembers, ...mockOffices]
        },
        {
          ...prev[1],
          items: mockAllPeople
        },
        prev[2] // Manter planos como estão
      ]);

    } catch (err: any) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceColumnId = result.source.droppableId;
    const destColumnId = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Se moveu dentro da mesma coluna
    if (sourceColumnId === destColumnId) {
      setColumns(prev => {
        const newColumns = [...prev];
        const columnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
        const [reorderedItem] = newColumns[columnIndex].items.splice(sourceIndex, 1);
        newColumns[columnIndex].items.splice(destIndex, 0, reorderedItem);
        return newColumns;
      });
    } else {
      // Se moveu entre colunas diferentes
      setColumns(prev => {
        const newColumns = [...prev];
        const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
        const destColumnIndex = newColumns.findIndex(col => col.id === destColumnId);
        
        const [movedItem] = newColumns[sourceColumnIndex].items.splice(sourceIndex, 1);
        newColumns[destColumnIndex].items.splice(destIndex, 0, movedItem);
        
        return newColumns;
      });
    }
  };

  const renderCard = (item: TeamMember | Office | SubscriptionPlan, index: number) => {
    // Card de Membro do Time
    if ('role' in item && 'email' in item) {
      const member = item as TeamMember;
      return (
        <Card key={member.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                {member.name.charAt(0)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle2">{member.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {member.email}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Chip 
                label={member.role} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={member.status} 
                size="small" 
                color={member.status === 'active' ? 'success' : 'warning'}
              />
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Card de Escritório
    if ('address' in item && 'members' in item) {
      const office = item as Office;
      return (
        <Card key={office.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <BusinessIcon color="primary" sx={{ mr: 2 }} />
              <Box flex={1}>
                <Typography variant="subtitle2">{office.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {office.address}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {office.members.length} membro(s)
            </Typography>
          </CardContent>
        </Card>
      );
    }

    // Card de Plano de Assinatura
    if ('price' in item && 'features' in item) {
      const plan = item as SubscriptionPlan;
      return (
        <Card key={plan.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <PaymentIcon color="primary" sx={{ mr: 2 }} />
              <Box flex={1}>
                <Typography variant="subtitle2">{plan.name}</Typography>
                <Typography variant="h6" color="primary">
                  {plan.price}
                </Typography>
              </Box>
            </Box>
            <Stack spacing={0.5} mb={1}>
              {plan.features.map((feature, idx) => (
                <Typography key={idx} variant="caption" color="textSecondary">
                  • {feature}
                </Typography>
              ))}
            </Stack>
            <Button 
              variant={plan.status === 'popular' ? 'contained' : 'outlined'}
              size="small" 
              fullWidth
            >
              {plan.status === 'popular' ? 'Mais Popular' : 'Escolher Plano'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Dashboard do Time
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Arraste e solte os cards entre as colunas para organizar seu time, escritórios e escolher planos
      </Typography>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {columns.map((column) => (
            <Grid item xs={12} md={4} key={column.id}>
              <Paper sx={{ p: 2, height: 'fit-content', minHeight: '500px' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {column.title}
                  </Typography>
                  {column.id === 'team' && (
                    <IconButton size="small" color="primary">
                      <AddIcon />
                    </IconButton>
                  )}
                </Box>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{
                        minHeight: '400px',
                        backgroundColor: snapshot.isDraggingOver ? '#f5f5f5' : 'transparent',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      {column.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                opacity: snapshot.isDragging ? 0.8 : 1,
                                transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                              }}
                            >
                              {renderCard(item, index)}
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  );
};

export default TeamDashboard;