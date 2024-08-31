import { useEffect, useState } from 'react';

import { Notification } from '@/components';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { getAllAdmins } from '@/services/admins';
import { getAllOffices } from '@/services/offices';
import { FiMinusCircle } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';
import { getWorkById } from '@/services/works';
import { getAllProfileCustomer } from '@/services/customers';
import { BsDownload } from 'react-icons/bs';
import { IoCheckmarkOutline } from 'react-icons/io5';

import { colors } from '@/styles/globals';
import api from '@/services/api';

import { moneyMask } from '@/utils/masks';

interface WorkDetailsProps {
  id: string | string[];
}

export default function WorkDetails({ id }: WorkDetailsProps) {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState<any>([]);
  const [isFormDataChanged, setIsFormDataChanged] = useState(false);
  const [status, setStatus] = useState('');

  const [workData, setWorkData] = useState<any>([]);
  const [subject, setSubject] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [areaValue, setAreaValue] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const [cardOneIsOpen, setCardOneIsOpen] = useState(true);
  const [cardTwoIsOpen, setCardTwoIsOpen] = useState(true);
  const [cardThreeIsOpen, setCardThreeIsOpen] = useState(true);
  const [cardFourIsOpen, setCardFourIsOpen] = useState(true);
  const [cardFiveIsOpen, setCardFiveIsOpen] = useState(false);
  const [cardSixIsOpen, setCardSixIsOpen] = useState(false);
  const [cardSevenIsOpen, setCardSevenIsOpen] = useState(false);

  const [allOffices, setAllOffices] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);

  const [downloadedDocuments, setDownloadedDocuments] = useState<Array<boolean>>(
    Array(workData?.attributes?.documents?.length).fill(false),
  );

  const [documentsPerCustomer, setDocumentsPerCustomer] = useState<any>({});

  const [customerNames, setCustomerNames] = useState<Array<string>>([]);

  const getCustomers = async () => {
    const response: {
      data: any;
    } = await getAllProfileCustomer('');
    setAllCustomers(response.data);
  };

  const getAdmins = async () => {
    const response: {
      data: any;
    } = await getAllAdmins('');
    setAllAdmins(response.data);
  };

  const getOffices = async () => {
    const response: {
      data: any;
    } = await getAllOffices('');
    setAllOffices(response.data);
  };

  const getAdminName = (id: number) => {
    const admin = allAdmins.find(admin => admin.id == id);

    return admin ? admin.attributes.name : 'Não Informado';
  };

  const getCustomerName = (id: number | string) => {
    const customer = allCustomers.find(customer => customer.id == id);
    return customer ? customer.attributes.name : 'Não Informado';
  };

  useEffect(() => {
    const documents = workData?.attributes?.documents;

    const documentsPerCustomer = documents?.reduce((acc: any, document: any) => {
      if (!acc[document.profile_customer_id]) {
        acc[document.profile_customer_id] = [];
      }

      acc[document.profile_customer_id].push(document);

      return acc;
    }, {});

    setDocumentsPerCustomer(documentsPerCustomer);
  }, [workData?.attributes?.documents]);

  useEffect(() => {
    const fetchCustomerNames = async () => {
      const names = await Promise.all(
        Object.keys(documentsPerCustomer ?? {}).map(async customerId => {
          const name = await getCustomerName(customerId);
          return `${name}`;
        }),
      );
      setCustomerNames(names);
    };

    fetchCustomerNames();
  }, [documentsPerCustomer]);

  const handleSubject = (subject: string) => {
    if (subject) {
      if (subject === 'administrative_subject') {
        setSubject('Administrativo');
      }

      if (subject === 'civil' || subject === 'civel') {
        setSubject('Cível');
      }

      if (subject === 'criminal') {
        setSubject('Criminal');
      }

      if (subject === 'social_security') {
        setSubject('Previdenciário');
      }

      if (subject === 'laborite') {
        setSubject('Trabalhista');
      }

      if (subject === 'tributary') {
        setSubject('Tributário');
      }

      if (subject === 'tributary_pis') {
        setSubject('Tributário Pis/Cofins insumos');
      }

      if (subject === 'others') {
        setSubject('Outros');
      }
    }
  };

  const handleArea = (area: string) => {
    if (area) {
      area === 'social_security_areas' && setArea('Previdenciário-Áreas');
      area === 'civil_area' && setArea('Cível-Área');
      area === 'laborite_areas' && setArea('Trabalhista-Áreas');
      area === 'tributary_areas' && setArea('Tributário-Áreas');
    }
  };

  const handleAreaValue = (area: string) => {
    if (area) {
      area === 'retirement_by_age' && setAreaValue('Aposentadoria Por Tempo de Contribuição');
      area === 'retirement_by_time' && setAreaValue('Aposentadoria Por Idade');
      area === 'retirement_by_rural' && setAreaValue('Aposentadoria Rural');
      area === 'disablement' &&
        setAreaValue('Benefícios Por Incapacidade - Auxílio Doença ou Acidente - Inválidez - LOAS');
      area === 'benefit_review' && setAreaValue('Revisão de Benefício Previdednciário');
      area === 'administrative_services' &&
        setAreaValue('Reconhecimento de Tempo, Averbação, Serviços Administrativos');
      area === 'family' && setAreaValue('Família');
      area === 'consumer' && setAreaValue('Consumidor');
      area === 'moral_damages' && setAreaValue('Reparação Cível - Danos Materiais - Danos Morais');
      area === 'labor_claim' && setAreaValue('Reclamatória Trabalhista');
      area === 'asphalt' && setAreaValue('Asfalto');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await getWorkById(id as string);

      if (data) {
        handleSubject(data.attributes.subject);

        let areaKey = '';

        if (data.attributes.subject === 'administrative_subject') {
          areaKey = 'administrative_areas';
        }

        if (data.attributes.subject === 'civil' || data.attributes.subject === 'civel') {
          areaKey = 'civil_area';
        }

        if (data.attributes.subject === 'criminal') {
          areaKey = '';
        }

        if (data.attributes.subject === 'social_security') {
          areaKey = 'social_security_areas';
        }

        if (data.attributes.subject === 'laborite') {
          areaKey = 'laborite_areas';
        }

        if (data.attributes.subject === 'tributary') {
          areaKey = 'tributary_areas';
        }

        if (data.attributes.subject === 'tributary_pis') {
          areaKey = '';
        }

        handleArea(areaKey);
        handleAreaValue(data.attributes[areaKey]);

        setWorkData(data);

        setFormData(data?.attributes?.work_events);
        setStatus(data?.attributes?.status);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, allOffices]);

  useEffect(() => {
    getOffices();
    getCustomers();
    getAdmins();
  }, []);

  useEffect(() => {
    const initialFormData = workData?.attributes?.work_events ?? [];

    if (initialFormData !== formData) {
      setIsFormDataChanged(true);
    } else {
      setIsFormDataChanged(false);
    }
  }, [formData, workData]);

  const handleFieldChange = (event: any, id: any, field: string) => {
    const { value } = event.target;

    const newFormData = formData.map((item: any) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value,
          changed: true,
        };
      }

      return item;
    });

    setFormData(newFormData);
  };

  const handleSaveChanges = async () => {
    for (const item of formData) {
      if (item.changed) {
        const { id, ...rest } = item;

        try {
          const response = await api.patch(`/work_events/${id}`, {
            work_event: {
              ...rest,
            },
          });

          if (response.status === 200) {
            setOpenSnackbar(true);
            setTimeout(() => {
              setOpenSnackbar(false);
            }, 2000);
            setMessage('Alterações salvas com sucesso.');
            setTypeMessage('success');
            setIsFormDataChanged(false);
          }
        } catch (error) {
          setOpenSnackbar(true);
          setTimeout(() => {
            setOpenSnackbar(false);
          }, 2000);
          setMessage('Erro ao salvar as alterações.');
          setTypeMessage('error');
        }
      }
    }
  };

  const handleSaveStatus = async (status: string) => {
    try {
      const response = await api.put(`/works/${id}`, {
        work: {
          status,
        },
      });

      if (response.status === 200) {
        setOpenSnackbar(true);
        setTimeout(() => {
          setOpenSnackbar(false);
        }, 2000);
        setMessage('Status alterado com sucesso.');
        setTypeMessage('success');

        setStatus(status);
      }
    } catch (error) {
      setOpenSnackbar(true);
      setTimeout(() => {
        setOpenSnackbar(false);
      }, 2000);
      setMessage('Erro ao alterar o status.');
      setTypeMessage('error');
    }
  };

  const mapProcedure = (procedure: string) => {
    switch (procedure) {
      case 'administrative':
        return 'Administrativo';
      case 'judicial':
        return 'Judicial';
      default:
        return 'Extrajudicial';
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: '#EEE',
        }}
      >
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <CircularProgress />
          </div>
        )}

        {!loading && workData && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <DetailsWrapper
              style={{
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <Flex
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Procedimento/Assunto
                    </span>
                    <ButtonShowContact>
                      {cardOneIsOpen ? (
                        <FiMinusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardOneIsOpen(!cardOneIsOpen)}
                        />
                      ) : (
                        <GoPlusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardOneIsOpen(!cardOneIsOpen)}
                        />
                      )}
                    </ButtonShowContact>
                  </Flex>
                  {cardOneIsOpen && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        paddingBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Cliente
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {`${
                              workData.attributes &&
                              workData.attributes.profile_customers &&
                              workData.attributes.profile_customers[0]
                                ? workData.attributes.profile_customers[0].name
                                : 'Não Informado'
                            }`}
                          </span>
                        </Flex>

                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Requerimento ou Assunto
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes && workData.attributes.number
                              ? workData.attributes.number
                              : 'Não Informado'}
                          </span>
                        </Flex>

                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Procedimento
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes && workData.attributes.procedures
                              ? workData.attributes.procedures.map(mapProcedure).join(', ')
                              : 'Não Informado'}
                          </span>
                        </Flex>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Assunto
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {subject ? subject : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            {area ? area : ''}
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {areaValue ? areaValue : ''}
                          </span>
                        </Flex>
                      </div>
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>

            <DetailsWrapper
              style={{
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <Flex
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Honorários
                    </span>
                    <ButtonShowContact>
                      {cardTwoIsOpen ? (
                        <FiMinusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardTwoIsOpen(!cardTwoIsOpen)}
                        />
                      ) : (
                        <GoPlusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardTwoIsOpen(!cardTwoIsOpen)}
                        />
                      )}
                    </ButtonShowContact>
                  </Flex>
                  {cardTwoIsOpen && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        paddingBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Honorários de Trabalho ou Êxito
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.honorary &&
                            workData.attributes.honorary.honorary_type
                              ? workData.attributes.honorary.honorary_type === 'both'
                                ? 'Ambos'
                                : workData.attributes.honorary.honorary_type === 'success'
                                ? 'Êxito'
                                : workData.attributes.honorary.honorary_type === 'work'
                                ? 'Trabalho'
                                : workData.attributes.honorary.honorary_type === 'bonus'
                                ? 'Pro-bono'
                                : 'Não Informado'
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Valor de Honorários Fixos
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.honorary &&
                            workData.attributes.honorary.fixed_honorary_value
                              ? `R$ ${moneyMask(workData.attributes.honorary.fixed_honorary_value)}`
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Valor de Honorários Percentuais
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.honorary &&
                            workData.attributes.honorary.percent_honorary_value
                              ? workData.attributes.honorary.percent_honorary_value + '%'
                              : 'Não contratado'}
                          </span>
                        </Flex>
                      </div>

                      {workData.attributes &&
                      workData.attributes.honorary &&
                      workData.attributes.honorary.parcelling
                        ? workData.attributes.honorary.parcelling === true && (
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                                gap: '18px',
                                padding: '0 32px',
                              }}
                            >
                              <Flex
                                style={{
                                  flexDirection: 'column',
                                  gap: '8px',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#344054',
                                    fontSize: '20px',
                                    fontWeight: '500',
                                  }}
                                >
                                  Parcelamento
                                </span>
                                <span
                                  style={{
                                    fontSize: '18px',
                                    color: '#344054',
                                    fontWeight: '400',
                                  }}
                                >
                                  {workData.attributes &&
                                  workData.attributes.honorary &&
                                  workData.attributes.honorary.parcelling
                                    ? workData.attributes.honorary.parcelling === true
                                      ? 'Sim'
                                      : 'Não'
                                    : 'Não Informado'}
                                </span>
                              </Flex>

                              <Flex
                                style={{
                                  flexDirection: 'column',
                                  gap: '8px',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#344054',
                                    fontSize: '20px',
                                    fontWeight: '500',
                                  }}
                                >
                                  Número de Parcelas
                                </span>
                                <span
                                  style={{
                                    fontSize: '18px',
                                    color: '#344054',
                                    fontWeight: '400',
                                  }}
                                >
                                  {workData.attributes &&
                                  workData.attributes.honorary &&
                                  workData.attributes.honorary.parcelling_value
                                    ? workData.attributes.honorary.parcelling_value + 'x'
                                    : 'Não Informado'}
                                </span>
                              </Flex>
                            </div>
                          )
                        : ''}
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>

            <DetailsWrapper
              style={{
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <Flex
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Poderes
                    </span>
                    <ButtonShowContact>
                      {cardThreeIsOpen ? (
                        <FiMinusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardThreeIsOpen(!cardThreeIsOpen)}
                        />
                      ) : (
                        <GoPlusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardThreeIsOpen(!cardThreeIsOpen)}
                        />
                      )}
                    </ButtonShowContact>
                  </Flex>
                  {cardThreeIsOpen && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        paddingBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span style={{ width: '100%' }}>
                            {workData.attributes && workData.attributes.powers && (
                              <>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '26px',
                                    marginLeft: '16px',
                                    marginBottom: '12px',
                                  }}
                                >
                                  <span
                                    style={{
                                      color: '#344054',
                                      fontSize: '20px',
                                      fontWeight: '500',
                                    }}
                                  >
                                    ID
                                  </span>
                                  <span
                                    style={{
                                      color: '#344054',
                                      fontSize: '20px',
                                      fontWeight: '500',
                                    }}
                                  >
                                    Descrição
                                  </span>
                                </div>
                                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                  <Table sx={{ width: '100%' }} aria-label="simple table">
                                    <TableBody>
                                      {workData.attributes.powers.map((power: any) => (
                                        <TableRow key={power.id}>
                                          <TableCell>{power.id}</TableCell>
                                          <TableCell>{power.description}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </>
                            )}
                          </span>
                        </Flex>
                      </div>
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>

            <DetailsWrapper
              style={{
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <Flex
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Informações Internas
                    </span>
                    <ButtonShowContact>
                      {cardFourIsOpen ? (
                        <FiMinusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardFourIsOpen(!cardFourIsOpen)}
                        />
                      ) : (
                        <GoPlusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardFourIsOpen(!cardFourIsOpen)}
                        />
                      )}
                    </ButtonShowContact>
                  </Flex>
                  {cardFourIsOpen && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        paddingBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '300px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Escritórios
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                              workData.attributes.offices &&
                              workData.attributes.offices.map((office: any) => {
                                return `${office.name} `;
                              })}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Advogados
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                              workData.attributes.profile_admins &&
                              workData.attributes.profile_admins.map((lawyer: any) => {
                                return `${lawyer.name} `;
                              })}
                          </span>
                        </Flex>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '300px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Atendimento Inicial
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.initial_atendee &&
                            getAdminName(workData.attributes.initial_atendee)
                              ? getAdminName(workData.attributes.initial_atendee)
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Estagiários da Procuração
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.intern &&
                            getAdminName(workData.attributes.intern)
                              ? getAdminName(workData.attributes.intern)
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Bacharéis /Paralegais da Procuração
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.bachelor &&
                            getAdminName(workData.attributes.bachelor)
                              ? getAdminName(workData.attributes.bachelor)
                              : 'Não Informado'}
                          </span>
                        </Flex>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '300px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Advogado Pessoa Física
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.physical_lawyer &&
                            getAdminName(workData.attributes.physical_lawyer)
                              ? getAdminName(workData.attributes.physical_lawyer)
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Advogado Responsável
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.responsible_lawyer &&
                            getAdminName(workData.attributes.responsible_lawyer)
                              ? getAdminName(workData.attributes.responsible_lawyer)
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Advogado
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.partner_lawyer &&
                            getAdminName(workData.attributes.partner_lawyer)
                              ? getAdminName(workData.attributes.partner_lawyer)
                              : 'Não Informado'}
                          </span>
                        </Flex>
                      </div>
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>

            <DetailsWrapper
              style={{
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <Flex
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Indicação
                    </span>
                    <ButtonShowContact>
                      {cardFiveIsOpen ? (
                        <FiMinusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardFiveIsOpen(!cardFiveIsOpen)}
                        />
                      ) : (
                        <GoPlusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardFiveIsOpen(!cardFiveIsOpen)}
                        />
                      )}
                    </ButtonShowContact>
                  </Flex>
                  {cardFiveIsOpen && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        paddingBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '300px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Nome
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.recommendations &&
                            workData.attributes.recommendations[0] &&
                            workData.attributes.recommendations[0].profile_customer_id &&
                            getCustomerName(
                              workData.attributes.recommendations[0].profile_customer_id,
                            )
                              ? getCustomerName(
                                  workData.attributes.recommendations[0].profile_customer_id,
                                )
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Comissão
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.recommendations &&
                            workData.attributes.recommendations[0] &&
                            workData.attributes.recommendations[0].commission
                              ? `R$ ${workData.attributes.recommendations[0].commission}`
                              : 'Não Informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Porcentagem
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes &&
                            workData.attributes.recommendations &&
                            workData.attributes.recommendations[0] &&
                            workData.attributes.recommendations[0].percentage
                              ? `${workData.attributes.recommendations[0].percentage}%`
                              : 'Não Informado'}
                          </span>
                        </Flex>
                      </div>
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>

            <DetailsWrapper
              style={{
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <Flex
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Atualização do Trabalho
                    </span>
                    <ButtonShowContact>
                      {cardSevenIsOpen ? (
                        <FiMinusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardSevenIsOpen(!cardSevenIsOpen)}
                        />
                      ) : (
                        <GoPlusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardSevenIsOpen(!cardSevenIsOpen)}
                        />
                      )}
                    </ButtonShowContact>
                  </Flex>
                  {cardSevenIsOpen && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        paddingBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Box>
                          <Flex>
                            <Typography variant="h6" color={'#2A3F54'}>
                              {'Status'}
                            </Typography>
                          </Flex>
                          <RadioGroup
                            value={status}
                            sx={{ flexDirection: 'row' }}
                            onChange={(e: any) => handleSaveStatus(e.target.value)}
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

                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          {formData.length > 0 ? (
                            formData.map((event: any, index: number) => (
                              <div
                                key={event.id}
                                style={{
                                  display: 'flex',
                                  gap: '18px',
                                  width: '100%',
                                }}
                              >
                                <Box
                                  style={{
                                    width: '600px',
                                  }}
                                >
                                  <Typography
                                    mb={'8px'}
                                    variant="h6"
                                    textAlign={'left'}
                                    color={'#2A3F54'}
                                  >
                                    {'Data da Movimentação'}
                                  </Typography>
                                  <input
                                    type="date"
                                    name="birth"
                                    style={{
                                      height: '40px',
                                      width: '100%',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      border: `1px solid #A8A8B3`,
                                      fontSize: '16px',
                                      fontFamily: 'Roboto',
                                      fontWeight: 400,
                                    }}
                                    value={
                                      event.date && event.date.split('T')[0]
                                        ? new Date(event.date).toISOString().split('T')[0]
                                        : event.date
                                        ? new Date(event.date).toISOString()
                                        : ''
                                    }
                                    onChange={e => handleFieldChange(e, event.id, 'date')}
                                  />
                                </Box>

                                <Box
                                  style={{
                                    width: '100%',
                                  }}
                                >
                                  <Flex
                                    style={{
                                      flexDirection: 'column',
                                      gap: '8px',
                                      alignItems: 'flex-start',
                                      width: '100%',
                                    }}
                                  >
                                    <Typography variant="h6" textAlign={'left'}>
                                      {'Descrição'}
                                    </Typography>
                                    <TextField
                                      variant="outlined"
                                      fullWidth
                                      size="small"
                                      autoComplete="off"
                                      placeholder={`Informe a descrição`}
                                      value={event.description}
                                      onChange={e => handleFieldChange(e, event.id, 'description')}
                                    />
                                  </Flex>
                                </Box>
                              </div>
                            ))
                          ) : (
                            <Typography variant="h6" color={'#2A3F54'}>
                              {'Sem Movimentações'}
                            </Typography>
                          )}
                        </Flex>

                        <Flex
                          style={{
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              width: '190px',
                              height: '36px',
                              background: '#2A3F54',
                              color: '#fff',
                              textTransform: 'none',
                              borderRadius: '4px',
                              fontSize: '18px',
                              fontWeight: 400,
                              ':hover': {
                                opacity: '0.8',
                              },
                              ':disabled': {
                                opacity: '1',
                                color: '#fff',
                              },
                            }}
                            disabled={isFormDataChanged ? false : true}
                            onClick={handleSaveChanges}
                          >
                            Salvar Alterações
                          </Button>
                        </Flex>
                      </div>
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>

            <DetailsWrapper
              style={{
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <Flex
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Informações Adicionais
                    </span>
                    <ButtonShowContact>
                      {cardSixIsOpen ? (
                        <FiMinusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardSixIsOpen(!cardSixIsOpen)}
                        />
                      ) : (
                        <GoPlusCircle
                          size={24}
                          color="#344054"
                          onClick={() => setCardSixIsOpen(!cardSixIsOpen)}
                        />
                      )}
                    </ButtonShowContact>
                  </Flex>
                  {cardSixIsOpen && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        paddingBottom: '20px',
                      }}
                    >
                      <Flex
                        style={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          width: '100%',
                        }}
                      >
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                            padding: '0 32px',
                          }}
                        >
                          Documentos Gerados
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            gap: '60px',
                            width: '100%',
                            flexWrap: 'wrap',
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                            padding: '0 32px',
                          }}
                        >
                          {customerNames.map((customerName, index) => (
                            <Box key={index}>
                              <Typography
                                variant="subtitle1"
                                style={{
                                  fontWeight: '500',
                                  fontSize: '20px',
                                  color: '#26B99A',
                                }}
                              >
                                {customerName}
                              </Typography>
                              {documentsPerCustomer[Object.keys(documentsPerCustomer)[index]].map(
                                (document: any, index: number) => (
                                  <div
                                    key={document.url}
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      style={{
                                        fontWeight: '400',
                                        fontSize: '18px',
                                        color: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        gap: '8px',
                                      }}
                                      onClick={() => {
                                        window.open(document.url, '_blank');
                                        setDownloadedDocuments(prev => ({
                                          ...prev,
                                          [document.url]: true,
                                        }));
                                      }}
                                    >
                                      {downloadedDocuments[document.url] ? (
                                        <IoCheckmarkOutline size={20} color={colors.green} />
                                      ) : (
                                        <BsDownload size={20} color={colors.primary} />
                                      )}
                                      {document.document_type
                                        ? document.document_type === 'procuration'
                                          ? 'Procuração'
                                          : document.document_type === 'waiver'
                                          ? 'Termo de Renúncia'
                                          : document.document_type === 'deficiency_statement'
                                          ? 'Declaração de Carência'
                                          : 'Contrato'
                                        : 'Procuração Simples'}
                                    </Typography>
                                  </div>
                                ),
                              )}
                            </Box>
                          ))}
                        </div>
                      </Flex>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '300px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Pendências
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes && workData.attributes.extra_pending_document
                              ? workData.attributes.extra_pending_document
                              : 'Não há pendências'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Pasta
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes && workData.attributes.folder
                              ? workData.attributes.folder
                              : 'Não informado'}
                          </span>
                        </Flex>
                        <Flex
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        >
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Notas Sobre o Caso
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {workData.attributes && workData.attributes.note
                              ? workData.attributes.note
                              : 'Não informado'}
                          </span>
                        </Flex>
                      </div>
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>
          </div>
        )}

        <Box width="100%" display="flex" justifyContent="end" mt={3}>
          <Button
            color="primary"
            variant="outlined"
            sx={{
              width: '100px',
              height: '36px',
            }}
            onClick={() => {
              window.location.href = '/trabalhos';
            }}
          >
            {'Fechar'}
          </Button>
        </Box>
      </div>

      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={typeMessage}
          onClose={() => setOpenSnackbar(false)}
        />
      )}
    </>
  );
}
