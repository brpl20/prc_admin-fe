import { getOfficeById } from '@/services/offices';

import { useEffect, useState } from 'react';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import { cnpjMask, phoneMask } from '@/utils/masks';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { Box, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { IAdminProps } from '@/interfaces/IAdmin';
import { getAllAdmins } from '@/services/admins';
import { FiMinusCircle } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';

interface OfficeDetailsProps {
  id: string | string[];
}

export default function OfficeDetails({ id }: OfficeDetailsProps) {
  const [allLawyers, SetAllLawyers] = useState<any>([]);

  const [officeData, setOfficeData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [officeDataIsOpen, setOfficeDataIsOpen] = useState(true);
  const [officeAddressIsOpen, setOfficeAddressIsOpen] = useState(true);
  const [officeContactIsOpen, setOfficeContactIsOpen] = useState(true);
  const [officeAdicionalIsOpen, setOfficeAdicionalIsOpen] = useState(false);

  const getAdmins = async () => {
    const response: {
      data: IAdminProps[];
    } = await getAllAdmins('');
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
      }
    } catch (error) {
    } finally {
      setLoading(false);
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

      {!loading && officeData && (
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
                </Flex>
                {officeDataIsOpen && (
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
                          {`${officeData.name ? officeData.name : ''} ${
                            officeData.last_name ? officeData.last_name : ''
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
                          Tipo de Escritório
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.office_type_description
                            ? officeData.office_type_description
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
                          OAB
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.oab ? officeData.oab : 'Não Informado'}
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
                          CNPJ
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.cnpj ? officeData.cnpj : 'Não Informado'}
                        </span>
                      </Flex>

                      <Flex
                        style={{
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      ></Flex>
                    </div>

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
                        }}
                      >
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          Tipo da Sociedade
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.society === 'company'
                            ? 'Empresarial'
                            : officeData.society === 'sole_proprietorship'
                            ? 'Sociedade Simples'
                            : officeData.society === 'individual'
                            ? 'Sociedade Empresária'
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
                          Data de Função Exp. OAB
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.foundation
                            ? officeData.foundation.split('-').reverse().join('/')
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
                    Endereço
                  </span>
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
                </Flex>
                {officeAddressIsOpen && (
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
                        }}
                      >
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          Endereço
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${officeData.street ? officeData.street : 'Não Informado'}`}
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
                          Número
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${officeData.number ? officeData.number : 'Não Informado'}`}
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
                          Complemento
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          Não Informado
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
                          CEP
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.cep ? officeData.cep : 'Não Informado'}
                        </span>
                      </Flex>
                      <Flex
                        style={{
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      ></Flex>
                    </div>
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
                        }}
                      >
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          Cidade
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${officeData.city ? officeData.city : 'Não Informado'}`}
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
                          Bairro
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${officeData.neighborhood ? officeData.neighborhood : 'Não Informado'}`}
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
                          Estado
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${officeData.state ? officeData.state : 'Não Informado'}`}
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
                    Contato
                  </span>
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
                </Flex>
                {officeContactIsOpen && (
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
                          Telefone
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${
                            officeData.phones &&
                            officeData.phones[0] &&
                            officeData.phones[0].phone_number
                              ? officeData.phones[0].phone_number
                              : 'Não Informado'
                          }`}
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
                          E-mail
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${
                            officeData.emails && officeData.emails[0] && officeData.emails[0].email
                              ? officeData.emails[0].email
                              : 'Não Informado'
                          }`}
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
                        ></span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        ></span>
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
                        ></span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        ></span>
                      </Flex>
                      <Flex
                        style={{
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'flex-start',
                          width: '220px',
                        }}
                      ></Flex>
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
                </Flex>
                {officeAdicionalIsOpen && (
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
                          Site
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.site ? officeData.site : 'Não Informado'}
                        </span>
                      </Flex>
                      <Flex
                        style={{
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'flex-start',
                          width: '330px',
                        }}
                      >
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          Responsável pelo Escritório
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {officeData.responsible_lawyer_id
                            ? officeData.responsible_lawyer_id
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
                        ></span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        ></span>
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
                        ></span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        ></span>
                      </Flex>
                      <Flex
                        style={{
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'flex-start',
                          width: '220px',
                        }}
                      ></Flex>
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
            window.location.href = '/escritorios';
          }}
        >
          {'Fechar'}
        </Button>
      </Box>
    </div>
  );
}
