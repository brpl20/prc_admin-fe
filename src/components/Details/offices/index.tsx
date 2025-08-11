import { getOfficeById } from '@/services/offices';
import { 
  createPartnership, 
  updatePartnership, 
  deletePartnership, 
  getLawOfficeById 
} from '@/services/lawOffices';

import { useEffect, useState } from 'react';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Chip
} from '@mui/material';
import Link from 'next/link';
import { IProfileAdmin } from '@/interfaces/IAdmin';
import { getAllProfileAdmins } from '@/services/admins';
import { FiMinusCircle, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';

interface OfficeDetailsProps {
  id: string | string[];
}

export default function OfficeDetails({ id }: OfficeDetailsProps) {
  const [allLawyers, SetAllLawyers] = useState<any>([]);

  const [officeData, setOfficeData] = useState<any>([]);
  const [lawOfficeData, setLawOfficeData] = useState<any>(null);
  const [partnerships, setPartnerships] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [officeDataIsOpen, setOfficeDataIsOpen] = useState(true);
  const [officeAddressIsOpen, setOfficeAddressIsOpen] = useState(true);
  const [officeContactIsOpen, setOfficeContactIsOpen] = useState(true);
  const [officeAdicionalIsOpen, setOfficeAdicionalIsOpen] = useState(false);
  const [partnershipsIsOpen, setPartnershipsIsOpen] = useState(false);
  
  // Partnership modal states
  const [partnershipModalOpen, setPartnershipModalOpen] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<any>(null);
  const [partnershipForm, setPartnershipForm] = useState({
    lawyer_id: '',
    partnership_type: 'associado',
    ownership_percentage: 0,
    start_date: '',
    end_date: '',
    is_active: true
  });

  const getAdmins = async () => {
    const response: {
      data: IProfileAdmin[];
    } = await getAllProfileAdmins('');
    SetAllLawyers(response.data);
  };

  const getLawyerName = (lawyerId: number) => {
    if (lawyerId) {
      const lawyer = allLawyers.find((lawyer: any) => lawyer.id == lawyerId);

      return (
        lawyer &&
        `${lawyer?.attributes.name ? lawyer?.attributes.name : ''} ${
          lawyer?.attributes.last_name ? lawyer?.attributes.last_name : ''
        }`
      );
    }
  };

  const fetchLawOfficeData = async () => {
    try {
      // Try to fetch law office data if this office has an associated legal entity
      const response = await getLawOfficeById(id as string);
      if (response.data) {
        setLawOfficeData(response.data);
        setPartnerships(response.data.partnerships || []);
      }
    } catch (error) {
      // Not a law office or doesn't exist yet
      setLawOfficeData(null);
      setPartnerships([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await getOfficeById(id as string);
      if (data) {
        const newData = {
          name: data.attributes.name ? data.attributes.name : '',
          oab: data.attributes.oab ? data.attributes.oab : '',
          cnpj: data.attributes.cnpj ? data.attributes.cnpj : '',
          cpf: data.attributes.cpf ? data.attributes.cpf : '',
          office_type_description: data.attributes.office_type_description
            ? data.attributes.office_type_description
            : '',
          society: data.attributes.society ? data.attributes.society : '',
          cep: data.attributes.cep ? data.attributes.cep : '',
          state: data.attributes.state ? data.attributes.state : '',
          city: data.attributes.city ? data.attributes.city : '',
          neighborhood: data.attributes.neighborhood ? data.attributes.neighborhood : '',
          address: data.attributes.address ? data.attributes.address : '',
          street: data.attributes.street ? data.attributes.street : '',
          number: data.attributes.number ? data.attributes.number : '',
          foundation: data.attributes.foundation ? data.attributes.foundation : '',
          phones: data.attributes.phones ? data.attributes.phones : '',
          emails: data.attributes.emails ? data.attributes.emails : '',
          site: data.attributes.site ? data.attributes.site : '',
          responsible_lawyer_id: data.attributes.responsible_lawyer_id
            ? getLawyerName(data.attributes.responsible_lawyer_id)
            : '',
        };

        setOfficeData(newData);
        await fetchLawOfficeData();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartnership = async () => {
    try {
      if (!lawOfficeData) return;
      
      await createPartnership(lawOfficeData.id, partnershipForm);
      await fetchLawOfficeData(); // Refresh data
      setPartnershipModalOpen(false);
      resetPartnershipForm();
    } catch (error) {
      console.error('Error creating partnership:', error);
    }
  };

  const handleUpdatePartnership = async () => {
    try {
      if (!lawOfficeData || !editingPartnership) return;
      
      await updatePartnership(lawOfficeData.id, editingPartnership.id, partnershipForm);
      await fetchLawOfficeData(); // Refresh data
      setPartnershipModalOpen(false);
      setEditingPartnership(null);
      resetPartnershipForm();
    } catch (error) {
      console.error('Error updating partnership:', error);
    }
  };

  const handleDeletePartnership = async (partnershipId: string) => {
    try {
      if (!lawOfficeData) return;
      
      if (confirm('Tem certeza que deseja remover este sócio/associado?')) {
        await deletePartnership(lawOfficeData.id, partnershipId);
        await fetchLawOfficeData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting partnership:', error);
    }
  };

  const openEditPartnership = (partnership: any) => {
    setEditingPartnership(partnership);
    setPartnershipForm({
      lawyer_id: partnership.lawyer_id,
      partnership_type: partnership.partnership_type,
      ownership_percentage: partnership.ownership_percentage,
      start_date: partnership.start_date || '',
      end_date: partnership.end_date || '',
      is_active: partnership.is_active
    });
    setPartnershipModalOpen(true);
  };

  const resetPartnershipForm = () => {
    setPartnershipForm({
      lawyer_id: '',
      partnership_type: 'associado',
      ownership_percentage: 0,
      start_date: '',
      end_date: '',
      is_active: true
    });
  };

  const getPartnershipTypeDisplay = (type: string) => {
    switch (type) {
      case 'socio': return 'Sócio';
      case 'associado': return 'Associado';
      case 'socio_de_servico': return 'Sócio de Serviço';
      default: return type;
    }
  };

  useEffect(() => {
    getAdmins();
  }, []);

  useEffect(() => {
    fetchData();
  }, [id, allLawyers]);

  return (
    <div
      style={{
        backgroundColor: '#EEE',
      }}
    >
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <CircularProgress />
        </div>
      )}

      {!loading && officeData && (
        <div className="flex flex-col gap-[20px] p-5 rounded-lg">
          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">
                    Identificação do Escritório
                  </span>

                  <ButtonShowContact>
                    {officeDataIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeDataIsOpen(!officeDataIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeDataIsOpen(!officeDataIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </div>

                {officeDataIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Nome</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.name ? officeData.name : ''} ${
                            officeData.last_name ? officeData.last_name : ''
                          }`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Tipo de Escritório
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.office_type_description || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">OAB</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.oab || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">CNPJ</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.cnpj || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]"></div>
                    </div>

                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Tipo da Sociedade
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.society === 'company'
                            ? 'Empresarial'
                            : officeData.society === 'sole_proprietorship'
                            ? 'Sociedade Simples'
                            : officeData.society === 'individual'
                            ? 'Sociedade Empresária'
                            : 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Data de Função Exp. OAB
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.foundation
                            ? officeData.foundation.split('-').reverse().join('/')
                            : 'Não Informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">Endereço</span>

                  <ButtonShowContact>
                    {officeAddressIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeAddressIsOpen(!officeAddressIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeAddressIsOpen(!officeAddressIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </div>

                {officeAddressIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Endereço</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.street || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Número</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.number || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Complemento</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          Não Informado
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">CEP</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.cep || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]"></div>
                    </div>

                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Cidade</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.city || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Bairro</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.neighborhood || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Estado</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.state || 'Não Informado'}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">Contato</span>

                  <ButtonShowContact>
                    {officeContactIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeContactIsOpen(!officeContactIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeContactIsOpen(!officeContactIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </div>

                {officeContactIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px] w-[300px]">
                        <span className="text-[#344054] text-[20px] font-medium">Telefone</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${
                            officeData.phones &&
                            officeData.phones[0] &&
                            officeData.phones[0].phone_number
                              ? officeData.phones[0].phone_number
                              : 'Não Informado'
                          }`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[220px]">
                        <span className="text-[#344054] text-[20px] font-medium">E-mail</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${
                            officeData.emails && officeData.emails[0] && officeData.emails[0].email
                              ? officeData.emails[0].email
                              : 'Não Informado'
                          }`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[220px]"></div>
                    </div>
                  </div>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">
                    Informações Adicionais
                  </span>

                  <ButtonShowContact>
                    {officeAdicionalIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeAdicionalIsOpen(!officeAdicionalIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setOfficeAdicionalIsOpen(!officeAdicionalIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </div>

                {officeAdicionalIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px] w-[300px]">
                        <span className="text-[#344054] text-[20px] font-medium">Site</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.site ? officeData.site : 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[330px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Responsável pelo Escritório
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.responsible_lawyer_id
                            ? officeData.responsible_lawyer_id
                            : 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[220px]"></div>
                    </div>
                  </div>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          {/* Partnership Management Section - Only show if this is a law office */}
          {lawOfficeData && (
            <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
              <ContainerDetails className="gap-[18px]">
                <>
                  <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiPlus size={24} color="#344054" />
                      <div className="w-[2px] bg-gray-300 h-8" />
                      <span className="text-[22px] font-medium text-[#344054]">
                        Sócios e Associados
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FiPlus />}
                        onClick={() => {
                          resetPartnershipForm();
                          setEditingPartnership(null);
                          setPartnershipModalOpen(true);
                        }}
                      >
                        Adicionar
                      </Button>
                      <ButtonShowContact>
                        {partnershipsIsOpen ? (
                          <FiMinusCircle
                            size={24}
                            color="#344054"
                            onClick={() => setPartnershipsIsOpen(!partnershipsIsOpen)}
                          />
                        ) : (
                          <GoPlusCircle
                            size={24}
                            color="#344054"
                            onClick={() => setPartnershipsIsOpen(!partnershipsIsOpen)}
                          />
                        )}
                      </ButtonShowContact>
                    </div>
                  </div>

                  {partnershipsIsOpen && (
                    <div className="flex flex-col gap-[18px] pb-[20px]">
                      {partnerships.length === 0 ? (
                        <div className="px-8 py-4 text-center text-gray-500">
                          Nenhum sócio ou associado cadastrado
                        </div>
                      ) : (
                        <div className="px-8 space-y-4">
                          {partnerships.map((partnership: any) => (
                            <div
                              key={partnership.id}
                              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Typography variant="subtitle2" color="textSecondary">
                                      Nome
                                    </Typography>
                                    <Typography variant="body1">
                                      {partnership.lawyer_name}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography variant="subtitle2" color="textSecondary">
                                      Tipo
                                    </Typography>
                                    <Chip
                                      label={getPartnershipTypeDisplay(partnership.partnership_type)}
                                      color={
                                        partnership.partnership_type === 'socio'
                                          ? 'primary'
                                          : partnership.partnership_type === 'socio_de_servico'
                                          ? 'secondary'
                                          : 'default'
                                      }
                                      size="small"
                                    />
                                  </div>
                                  <div>
                                    <Typography variant="subtitle2" color="textSecondary">
                                      Participação
                                    </Typography>
                                    <Typography variant="body1">
                                      {partnership.ownership_percentage}%
                                    </Typography>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEditPartnership(partnership)}
                                  >
                                    <FiEdit2 size={16} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeletePartnership(partnership.id)}
                                    color="error"
                                  >
                                    <FiTrash2 size={16} />
                                  </IconButton>
                                </div>
                              </div>
                              {partnership.start_date && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <Typography variant="caption" color="textSecondary">
                                    Início: {new Date(partnership.start_date).toLocaleDateString('pt-BR')}
                                    {partnership.end_date && (
                                      <> | Fim: {new Date(partnership.end_date).toLocaleDateString('pt-BR')}</>
                                    )}
                                    {' | Status: '}
                                    <span
                                      className={
                                        partnership.is_active ? 'text-green-600' : 'text-red-600'
                                      }
                                    >
                                      {partnership.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                  </Typography>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>
          )}
        </div>
      )}

      {/* Partnership Modal */}
      <Dialog open={partnershipModalOpen} onClose={() => setPartnershipModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPartnership ? 'Editar Sócio/Associado' : 'Adicionar Sócio/Associado'}
        </DialogTitle>
        <DialogContent className="space-y-4">
          <FormControl fullWidth margin="normal">
            <InputLabel>Advogado</InputLabel>
            <Select
              value={partnershipForm.lawyer_id}
              onChange={(e) => setPartnershipForm({ ...partnershipForm, lawyer_id: e.target.value })}
            >
              {allLawyers.map((lawyer: any) => (
                <MenuItem key={lawyer.id} value={lawyer.id}>
                  {lawyer.attributes.name} {lawyer.attributes.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Participação</InputLabel>
            <Select
              value={partnershipForm.partnership_type}
              onChange={(e) => setPartnershipForm({ ...partnershipForm, partnership_type: e.target.value })}
            >
              <MenuItem value="associado">Associado</MenuItem>
              <MenuItem value="socio">Sócio</MenuItem>
              <MenuItem value="socio_de_servico">Sócio de Serviço</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Percentual de Participação (%)"
            type="number"
            value={partnershipForm.ownership_percentage}
            onChange={(e) => setPartnershipForm({ ...partnershipForm, ownership_percentage: parseFloat(e.target.value) || 0 })}
            margin="normal"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />

          <TextField
            fullWidth
            label="Data de Início"
            type="date"
            value={partnershipForm.start_date}
            onChange={(e) => setPartnershipForm({ ...partnershipForm, start_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Data de Fim (opcional)"
            type="date"
            value={partnershipForm.end_date}
            onChange={(e) => setPartnershipForm({ ...partnershipForm, end_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={partnershipForm.is_active ? 'true' : 'false'}
              onChange={(e) => setPartnershipForm({ ...partnershipForm, is_active: e.target.value === 'true' })}
            >
              <MenuItem value="true">Ativo</MenuItem>
              <MenuItem value="false">Inativo</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartnershipModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={editingPartnership ? handleUpdatePartnership : handleCreatePartnership}
            variant="contained"
          >
            {editingPartnership ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box width="100%" display="flex" justifyContent="end" mt={3}>
        <Button
          color="primary"
          variant="outlined"
          sx={{
            width: '100px',
            height: '36px',
          }}
          onClick={() => {
            window.location.href = '/escritorios';
          }}
        >
          {'Fechar'}
        </Button>
      </Box>
    </div>
  );
}
