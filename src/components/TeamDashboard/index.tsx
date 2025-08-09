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
  Business as BusinessIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
// Removido DropIndicator devido a problema com CSS global do Next.js
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { getAllProfileAdmins } from '@/services/admins';
import { getAllOffices } from '@/services/offices';

// Componente DropArea para colunas
interface DropAreaProps {
  columnId: string;
  children: React.ReactNode;
}

const DropArea: React.FC<DropAreaProps> = ({ columnId, children }) => {
  const dropRef = React.useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = React.useState(false);

  React.useEffect(() => {
    const element = dropRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ columnId }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [columnId]);

  return (
    <Box
      ref={dropRef}
      sx={{
        minHeight: '400px',
        borderRadius: 1,
        p: 1,
        backgroundColor: isDraggedOver ? '#e3f2fd' : 'transparent',
        border: isDraggedOver ? '2px dashed #1976d2' : '2px dashed transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </Box>
  );
};

// Indicador de Drop Customizado
const CustomDropIndicator: React.FC<{ position: 'top' | 'bottom' | 'left' | 'right' }> = ({ position }) => {
  const styles = {
    position: 'absolute' as const,
    backgroundColor: '#1976d2',
    zIndex: 1000,
    ...(position === 'bottom' && {
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
    }),
    ...(position === 'top' && {
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
    }),
    ...(position === 'left' && {
      top: 0,
      bottom: 0,
      left: 0,
      width: '2px',
    }),
    ...(position === 'right' && {
      top: 0,
      bottom: 0,
      right: 0,
      width: '2px',
    }),
  };
  
  return <div style={styles} />;
};

// Componente DraggableCard usando Pragmatic Drag and Drop
interface DraggableCardProps {
  item: TeamMember | Office | SubscriptionPlan;
  columnId: string;
  index: number;
  children: React.ReactNode;
  sx?: any;
  onClick?: () => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ 
  item, 
  columnId, 
  index, 
  children, 
  sx, 
  onClick 
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDraggedOver, setIsDraggedOver] = React.useState(false);

  React.useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    // Configurar como draggable
    return draggable({
      element,
      getInitialData: () => ({ itemId: item.id, columnId, index }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [item.id, columnId, index]);

  React.useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    // Configurar como drop target
    return dropTargetForElements({
      element,
      getData: () => ({ columnId, index }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [columnId, index]);

  return (
    <Card
      ref={cardRef}
      sx={{
        ...sx,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': { boxShadow: 3 },
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: isDraggedOver ? '#e3f2fd' : 'white',
        transition: 'all 0.2s ease',
        transform: isDragging ? 'rotate(5deg)' : 'none',
      }}
      onClick={onClick}
    >
      {children}
      {isDraggedOver && <CustomDropIndicator position="bottom" />}
    </Card>
  );
};

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  status: string;
  oab?: string;
  cpf?: string;
}

interface Office {
  id: string;
  name: string;
  cnpj?: string;
  address: string;
  members: TeamMember[];
  profile_admins?: TeamMember[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'team',
      title: 'Time',
      items: []
    },
    {
      id: 'available',
      title: 'Disponíveis (Pessoas & Offices)',
      items: []
    },
    {
      id: 'subscriptions',
      title: 'Planos de Assinatura',
      items: []
    }
  ]);

  const [subscriptionPlans] = useState<SubscriptionPlan[]>([{
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
    }]);

  // Removido expandedOffices - offices não expandem mais

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar ProfileAdmins reais do backend
      const profileAdminsResponse = await getAllProfileAdmins('');
      const profileAdmins: TeamMember[] = profileAdminsResponse.data.map((admin: any) => ({
        id: admin.id.toString(),
        name: `${admin.name} ${admin.last_name || ''}`.trim(),
        role: admin.role || 'lawyer',
        email: admin.admin?.email || admin.emails?.[0]?.email || '',
        status: admin.status || 'active',
        oab: admin.oab,
        cpf: admin.cpf
      }));

      // Buscar Offices reais do backend
      const officesResponse = await getAllOffices('');
      const offices: Office[] = officesResponse.data.map((office: any) => {
        const officeMembers = office.profile_admins?.map((admin: any) => ({
          id: admin.id.toString(),
          name: `${admin.name} ${admin.last_name || ''}`.trim(),
          role: admin.role || 'lawyer',
          email: admin.admin?.email || admin.emails?.[0]?.email || '',
          status: admin.status || 'active',
          oab: admin.oab
        })) || [];
        
        return {
          id: office.id.toString(),
          name: office.name,
          cnpj: office.cnpj,
          address: `${office.street || ''}, ${office.number || ''} - ${office.city || ''}/${office.state || ''}`.replace(/^, /, '').replace(/ - \//, '').trim() || 'Endereço não informado',
          members: officeMembers,
          profile_admins: officeMembers
        };
      });

      // Combinar ProfileAdmins e Offices na coluna de disponíveis
      const allAvailableItems = [...profileAdmins, ...offices];
      
      setColumns(prev => [
        {
          ...prev[0],
          items: [] // Time começará vazio, mas pode receber cards
        },
        {
          ...prev[1],
          items: allAvailableItems // ProfileAdmins + Offices juntos
        },
        {
          ...prev[2],
          items: subscriptionPlans // Planos de assinatura
        }
      ]);

    } catch (err: any) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pragmatic Drag and Drop setup
  useEffect(() => {
    return monitorForElements({
      onDrop({ location, source }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destData = destination.data;
        
        if (!sourceData || !destData) return;

        const sourceColumnId = sourceData.columnId as string;
        const destColumnId = destData.columnId as string;
        const itemId = sourceData.itemId as string;
        
        // Se for drop em uma coluna (não em um card específico)
        const isColumnDrop = !destData.index && destData.index !== 0;
        const destIndex = isColumnDrop ? undefined : (destData.index as number);

        // Se moveu dentro da mesma coluna
        if (sourceColumnId === destColumnId && !isColumnDrop) {
          setColumns(prev => {
            const newColumns = [...prev];
            const columnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
            const sourceIndex = newColumns[columnIndex].items.findIndex(item => item.id === itemId);
            
            if (sourceIndex !== -1) {
              const [reorderedItem] = newColumns[columnIndex].items.splice(sourceIndex, 1);
              newColumns[columnIndex].items.splice(destIndex!, 0, reorderedItem);
            }
            return newColumns;
          });
        } else {
          // Se moveu entre colunas diferentes
          setColumns(prev => {
            const newColumns = [...prev];
            const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
            const destColumnIndex = newColumns.findIndex(col => col.id === destColumnId);
            const sourceIndex = newColumns[sourceColumnIndex].items.findIndex(item => item.id === itemId);
            
            if (sourceIndex !== -1 && destColumnIndex !== -1) {
              const [movedItem] = newColumns[sourceColumnIndex].items.splice(sourceIndex, 1);
              // Se for drop na coluna, adicionar no final; senão, na posição específica
              if (isColumnDrop) {
                newColumns[destColumnIndex].items.push(movedItem);
              } else {
                newColumns[destColumnIndex].items.splice(destIndex!, 0, movedItem);
              }
            }
            
            return newColumns;
          });
        }
      }
    });
  }, []);

  // Auto-scroll setup
  useEffect(() => {
    return autoScrollForElements({
      element: document.documentElement,
    });
  }, []);

  // Removido handleOfficeClick - offices não expandem mais

  const renderCard = (item: TeamMember | Office | SubscriptionPlan, index: number, columnId: string) => {
    // Card de Membro do Time
    if ('role' in item && 'email' in item) {
      const member = item as TeamMember;
      return (
        <DraggableCard 
          key={member.id} 
          item={member} 
          columnId={columnId} 
          index={index}
          sx={{ mb: 2 }}
        >
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
        </DraggableCard>
      );
    }

    // Card de Escritório
    if ('address' in item && 'members' in item) {
      const office = item as Office;
      
      return (
        <DraggableCard
          key={office.id}
          item={office}
          columnId={columnId}
          index={index}
          sx={{
            mb: 2
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <BusinessIcon color="primary" sx={{ mr: 2 }} />
              <Box flex={1}>
                <Typography variant="subtitle2">{office.name}</Typography>
                {office.cnpj && (
                  <Typography variant="caption" color="textSecondary" display="block">
                    CNPJ: {office.cnpj}
                  </Typography>
                )}
                <Typography variant="caption" color="textSecondary" display="block">
                  {office.address}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {office.members?.length || 0} membro(s)
            </Typography>
          </CardContent>
        </DraggableCard>
      );
    }

    // Card de Plano de Assinatura
    if ('price' in item && 'features' in item) {
      const plan = item as SubscriptionPlan;
      return (
        <DraggableCard
          key={plan.id}
          item={plan}
          columnId={columnId}
          index={index}
          sx={{ mb: 2 }}
        >
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
        </DraggableCard>
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

      <div>
        <Grid container spacing={3} sx={{ overflowX: 'auto' }}>
          {columns.map((column, index) => {
            // Calcular largura dinâmica baseada no número de colunas
            const totalColumns = columns.length;
            const minWidth = totalColumns > 3 ? 300 : undefined;
            const gridSize = totalColumns <= 3 ? 12 / totalColumns : undefined;
            
            return (
            <Grid 
              item 
              xs={12} 
              md={gridSize || false} 
              key={column.id}
              sx={{ 
                minWidth: minWidth,
                flexShrink: 0 
              }}
            >
              <Paper sx={{ p: 2, height: 'fit-content', minHeight: '500px' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {column.title}
                  </Typography>
                  {/* Remover botão de adicionar da coluna Team */}
                </Box>

                <DropArea columnId={column.id}>
                  {column.items.map((item, itemIndex) => 
                    renderCard(item, itemIndex, column.id)
                  )}
                </DropArea>
              </Paper>
            </Grid>
          );
          })}
        </Grid>
      </div>
    </Box>
  );
};

export default TeamDashboard;