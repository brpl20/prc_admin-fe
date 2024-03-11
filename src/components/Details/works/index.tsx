import { useEffect, useState } from 'react';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import { cpfMask, moneyMask, rgMask } from '@/utils/masks';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { getAdminByID, getAllAdmins } from '@/services/admins';
import { getAllOffices } from '@/services/offices';
import { FiMinusCircle } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';
import { getWorkById } from '@/services/works';
import { getAllCustomers } from '@/services/customers';
import { BsDownload } from 'react-icons/bs';
import { IoCheckmarkOutline } from 'react-icons/io5';

import { colors } from '@/styles/globals';

interface WorkDetailsProps {
  id: string | string[];
}

export default function WorkDetails({ id }: WorkDetailsProps) {
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
    } = await getAllCustomers();
    setAllCustomers(response.data);
  };

  const getAdmins = async () => {
    const response: {
      data: any;
    } = await getAllAdmins();
    setAllAdmins(response.data);
  };

  const getOffices = async () => {
    const response: {
      data: any;
    } = await getAllOffices();
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
          console.log(name);
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
      }
    } catch (error) {
      console.log(error);
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

  return (
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
                            ? workData.attributes.procedures.map((procedure: any) => {
                                return procedure === 'administrative'
                                  ? 'Administrativo '
                                  : procedure === 'judicial'
                                  ? 'Judicial '
                                  : 'Extrajudicial';
                              })
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
                            ? workData.attributes.honorary.fixed_honorary_value
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
                          workData.attributes.honorary.parcelling_value
                            ? workData.attributes.honorary.parcelling_value + 'x'
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
                        ></span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        ></span>
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
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
                          Descrição
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                            textTransform: 'capitalize',
                          }}
                        >
                          {workData.attributes &&
                            workData.attributes.powers &&
                            workData.attributes.powers.map((power: any) => {
                              return `${power.description} `;
                            })}
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
  );
}
