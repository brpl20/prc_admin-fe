import { getCustomerById } from '@/services/customers';
import { useEffect, useState } from 'react';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import { FiMinusCircle } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';
import { Box, Button, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';

interface PersonalDataProps {
  id: string | string[];
  type?: string | string[];
}

interface PersonalData {
  name: string;
  last_name: string;
  full_name: string;
  state: string;
  city: string;
  zip_code: string;
  description: string;
  neighborhood: string;
  street: string;
  number: string;
  birth: string;
  gender: string;
  capacity: string;
  nationality: string;
  civil_status: string;
  cpf: string;
  cnpj: string;
  rg: string;
  accountant_id: string;
  mother_name: string;
  customer_type: string;
  company: string;
  profession: string;
  number_benefit: string;
  nit: string;
  inss_password: string;
  emails: [
    {
      email: string;
    },
  ];
  phones: [
    {
      phone_number: string;
    },
  ];
  bank_accounts: [
    {
      account: string;
      agency: string;
      bank_name: string;
      id: string;
      operation: string;
      pix: string;
      type_account: string;
    },
  ];
}

const PersonalData = ({ id, type }: PersonalDataProps) => {
  const { data: session } = useSession();

  const [personalData, setPersonalData] = useState({} as PersonalData);
  const [personalDataIsOpen, setPersonalDataIsOpen] = useState(true);
  const [addressIsOpen, setAddressIsOpen] = useState(true);
  const [contactIsOpen, setContactIsOpen] = useState(true);
  const [bankIsOpen, setBankIsOpen] = useState(false);
  const [aditionalIsOpen, setAditionalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await getCustomerById(id as string);

      if (data) {
        const address = data.attributes.addresses[0]
          ? data.attributes.addresses[0]
          : [
              {
                state: 'Não Informado',
                city: 'Não Informado',
                zip_code: 'Não Informado',
                description: 'Não Informado',
                neighborhood: 'Não Informado',
                street: 'Não Informado',
                number: 'Não Informado',
              },
            ];

        const customerData = {
          name: data.attributes.name ? data.attributes.name : '',
          last_name: data.attributes.last_name ? data.attributes.last_name : '',
          cpf: data.attributes.cpf ? data.attributes.cpf : 'Não Informado',
          cnpj: data.attributes.cnpj ? data.attributes.cnpj : 'Não Informado',
          rg: data.attributes.rg ? data.attributes.rg : 'Não Informado',
          state: address.state ? address.state : 'Não Informado',
          city: address.city ? address.city : 'Não Informado',
          zip_code: address.zip_code ? address.zip_code : 'Não Informado',
          description: address.description ? address.description : 'Não Informado',
          neighborhood: address.neighborhood ? address.neighborhood : 'Não Informado',
          number: address.number ? address.number : 'Não Informado',
          street: address.street ? address.street : 'Não Informado',
          capacity: data.attributes.capacity ? data.attributes.capacity : 'Não Informado',
          birth: data.attributes.birth ? data.attributes.birth : 'Não Informado',
          gender: data.attributes.gender ? data.attributes.gender : 'Não Informado',
          nationality: data.attributes.nationality ? data.attributes.nationality : 'Não Informado',
          civil_status: data.attributes.civil_status
            ? data.attributes.civil_status
            : 'Não Informado',
          emails: data.attributes.emails ? data.attributes.emails : 'Não Informado',
          phones: data.attributes.phones ? data.attributes.phones : 'Não Informado',
          mother_name: data.attributes.mother_name ? data.attributes.mother_name : '',
          customer_type: data.attributes.customer_type ? data.attributes.customer_type : '',
          bank_accounts: data.attributes.bank_accounts ? data.attributes.bank_accounts : '',
          profession: data.attributes.profession ? data.attributes.profession : '',
          company: data.attributes.company ? data.attributes.company : '',
          number_benefit: data.attributes.number_benefit ? data.attributes.number_benefit : '',
          nit: data.attributes.nit ? data.attributes.nit : '',
          inss_password: data.attributes.inss_password ? data.attributes.inss_password : '',
        };

        setPersonalData(customerData as PersonalData);
      }
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

      {!loading && personalData && (
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
                    Dados Pessoais
                  </span>
                  <ButtonShowContact>
                    {personalDataIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {personalDataIsOpen && (
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
                          Nome Completo
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${personalData.name ? personalData.name : ''} ${
                            personalData.last_name ? personalData.last_name : ''
                          }`}
                        </span>
                      </Flex>

                      {(personalData.customer_type === 'physical_person' ||
                        personalData.customer_type === 'counter' ||
                        personalData.customer_type === 'representative') && (
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
                            CPF
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {personalData.cpf ? personalData.cpf : 'Não Informado'}
                          </span>
                        </Flex>
                      )}

                      {personalData.customer_type === 'legal_person' && (
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
                            {personalData.cnpj ? personalData.cnpj : 'Não Informado'}
                          </span>
                        </Flex>
                      )}

                      {(personalData.customer_type === 'physical_person' ||
                        personalData.customer_type === 'representative' ||
                        personalData.customer_type === 'counter') && (
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
                            RG
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            {personalData.rg ? personalData.rg : 'Não Informado'}
                          </span>
                        </Flex>
                      )}

                      {(personalData.customer_type === 'representative' ||
                        personalData.customer_type === 'counter' ||
                        personalData.customer_type === 'physical_person') && (
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
                            Data de Nascimento
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                            }}
                          >
                            {personalData.birth
                              ? personalData.birth.split('-').reverse().join('/')
                              : 'Não Informado'}
                          </span>
                        </Flex>
                      )}

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
                          Nome da Mãe
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.mother_name ? personalData.mother_name : 'Não Informado'}
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
                          Naturalidade
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.nationality
                            ? personalData.nationality === 'brazilian'
                              ? 'Brasileiro'
                              : 'Estrangeiro'
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
                          Estado Civil
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.civil_status
                            ? personalData.civil_status === 'single'
                              ? 'Solteiro'
                              : personalData.civil_status === 'union'
                              ? 'União Estável'
                              : personalData.civil_status === 'married'
                              ? 'Casado'
                              : personalData.civil_status === 'divorced'
                              ? 'Divorciado'
                              : personalData.civil_status === 'widower'
                              ? 'Viúvo'
                              : ''
                            : ''}
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
                          Gênero
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.gender
                            ? personalData.gender === 'male'
                              ? 'Masculino'
                              : 'Feminino'
                            : ''}
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
                          Capacidade
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.capacity
                            ? personalData.capacity === 'able'
                              ? 'Capaz'
                              : 'Incapaz'
                            : ''}
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
                    Endereço
                  </span>
                  <ButtonShowContact>
                    {addressIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setAddressIsOpen(!addressIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setAddressIsOpen(!addressIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {addressIsOpen && (
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
                          {`${personalData.street ? personalData.street : 'Não Informado'}`}
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
                          {`${personalData.number ? personalData.number : 'Não Informado'}`}
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
                          {personalData.zip_code ? personalData.zip_code : 'Não Informado'}
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
                          {`${personalData.city ? personalData.city : 'Não Informado'}`}
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
                          {`${
                            personalData.neighborhood ? personalData.neighborhood : 'Não Informado'
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
                          Estado
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${personalData.state ? personalData.state : 'Não Informado'}`}
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
                    {contactIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setContactIsOpen(!contactIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setContactIsOpen(!contactIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {contactIsOpen && (
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
                            personalData.phones &&
                            personalData.phones[0] &&
                            personalData.phones[0].phone_number
                              ? personalData.phones[0].phone_number
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
                            personalData.emails &&
                            personalData.emails[0] &&
                            personalData.emails[0].email
                              ? personalData.emails[0].email
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
                {session?.role != 'trainee' && (
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
                        Dados Bancários
                      </span>
                      <ButtonShowContact>
                        {bankIsOpen ? (
                          <FiMinusCircle
                            size={24}
                            color="#344054"
                            onClick={() => setBankIsOpen(!bankIsOpen)}
                          />
                        ) : (
                          <GoPlusCircle
                            size={24}
                            color="#344054"
                            onClick={() => setBankIsOpen(!bankIsOpen)}
                          />
                        )}
                      </ButtonShowContact>
                    </Flex>
                    {bankIsOpen && (
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
                              Banco
                            </span>
                            <span
                              style={{
                                fontSize: '18px',
                                color: '#344054',
                                fontWeight: '400',
                              }}
                            >
                              {personalData.bank_accounts[0] &&
                              personalData.bank_accounts[0].bank_name
                                ? personalData.bank_accounts[0].bank_name
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
                              Agência
                            </span>
                            <span
                              style={{
                                fontSize: '18px',
                                color: '#344054',
                                fontWeight: '400',
                              }}
                            >
                              {personalData.bank_accounts[0] && personalData.bank_accounts[0].agency
                                ? personalData.bank_accounts[0].agency
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
                              Operação
                            </span>
                            <span
                              style={{
                                fontSize: '18px',
                                color: '#344054',
                                fontWeight: '400',
                              }}
                            >
                              {personalData.bank_accounts[0] &&
                              personalData.bank_accounts[0].operation
                                ? personalData.bank_accounts[0].operation
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
                              Conta
                            </span>
                            <span
                              style={{
                                fontSize: '18px',
                                color: '#344054',
                                fontWeight: '400',
                              }}
                            >
                              {personalData.bank_accounts[0] &&
                              personalData.bank_accounts[0].account
                                ? personalData.bank_accounts[0].account
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
                              Pix
                            </span>
                            <span
                              style={{
                                fontSize: '18px',
                                color: '#344054',
                                fontWeight: '400',
                              }}
                            >
                              {personalData.bank_accounts[0] && personalData.bank_accounts[0].pix
                                ? personalData.bank_accounts[0].pix
                                : 'Não Informado'}
                            </span>
                          </Flex>
                        </div>
                      </div>
                    )}
                  </>
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
                    {aditionalIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setAditionalIsOpen(!aditionalIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setAditionalIsOpen(!aditionalIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {aditionalIsOpen && (
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
                          Profissão
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.profession ? personalData.profession : 'Não Informado'}
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
                          Empresa Atual
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.company ? personalData.company : 'Não Informado'}
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
                          Número de Benefício
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.number_benefit
                            ? personalData.number_benefit
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
                          NIT
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.nit ? personalData.nit : 'Não Informado'}
                        </span>
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
                          Nome da Mãe
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.mother_name ? personalData.mother_name : 'Não Informado'}
                        </span>
                      </Flex>
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
                          Senha do meu INSS
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {personalData.inss_password
                            ? personalData.inss_password
                            : 'Não Informado'}
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
            window.location.href = '/clientes';
          }}
        >
          {'Fechar'}
        </Button>
      </Box>
    </div>
  );
};

export default PersonalData;
