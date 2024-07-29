import { getCustomerById, getAllProfileCustomer } from '@/services/customers';

import { useEffect, useState } from 'react';

import { ContainerDetails, DetailsWrapper, ButtonShowContact } from '../styles';
import { FiMinusCircle } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';
import { Box, Button, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';

import { phoneMask, cpfMask, rgMask } from '@/utils/masks';

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
  represent: {
    id: number;
    profile_customer_id: number;
    representor_id: number;
  };
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

  const [representorsList, setRepresentorsList] = useState([] as any);

  const [personalData, setPersonalData] = useState({} as PersonalData);
  const [handleGender, setHandleGender] = useState('o');
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
          represent: data.attributes.represent ? data.attributes.represent : '',
          inss_password: data.attributes.inss_password ? data.attributes.inss_password : '',
        };

        if (data.attributes.gender === 'female') {
          setHandleGender('a');
        }

        setPersonalData(customerData as PersonalData);
      }
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  const EmailList =
    personalData.emails && personalData.emails.length > 0
      ? personalData.emails.map((phone, index) => (
          <span key={index} style={{ display: 'block' }}>
            {phone.email}
          </span>
        ))
      : 'Não Informado';

  const phoneNumbers =
    personalData.phones && personalData.phones.length > 0
      ? personalData.phones.map((phone, index) => (
          <span key={index} style={{ display: 'block' }}>
            {phoneMask(phone.phone_number)}
          </span>
        ))
      : 'Não Informado';

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const getRepresentors = async () => {
      const allCustomers = await getAllProfileCustomer();
      const response = allCustomers.data;

      const representors = response.filter(
        (customer: any) => customer.attributes.customer_type === 'representative',
      );

      setRepresentorsList(representors);
    };

    getRepresentors();
  }, []);

  const handleCapacity = () => {
    switch (personalData.capacity) {
      case 'able':
        return 'Capaz';
      case 'relatively':
        return 'Relativamente Incapaz';
      default:
        return 'Absolutamente Incapaz';
    }
  };

  const handleTranslationGender = (civilStatus: string) => {
    switch (civilStatus) {
      case 'single':
        return `Solteir${handleGender}`;
      case 'married':
        return `Casad${handleGender}`;
      case 'divorced':
        return `Divorciad${handleGender}`;
      case 'widower':
        return `Viúv${handleGender}`;
      default:
        return 'Não Informado';
    }
  };

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
                <div
                  className="flex"
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
                </div>
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
                      <div
                        className="flex"
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
                      </div>

                      {(personalData.customer_type === 'physical_person' ||
                        personalData.customer_type === 'counter' ||
                        personalData.customer_type === 'representative') && (
                        <div className="flex flex-col gap-[8px] items-start">
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
                            {personalData.cpf ? cpfMask(personalData.cpf) : 'Não Informado'}
                          </span>
                        </div>
                      )}

                      {personalData.customer_type === 'legal_person' && (
                        <div className="flex flex-col gap-[8px] items-start">
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
                        </div>
                      )}

                      {(personalData.customer_type === 'physical_person' ||
                        personalData.customer_type === 'representative' ||
                        personalData.customer_type === 'counter') && (
                        <div className="flex flex-col gap-[8px] items-start">
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
                            {personalData.rg ? rgMask(personalData.rg) : 'Não Informado'}
                          </span>
                        </div>
                      )}

                      {(personalData.customer_type === 'representative' ||
                        personalData.customer_type === 'counter' ||
                        personalData.customer_type === 'physical_person') && (
                        <div className="flex flex-col gap-[8px] items-start">
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
                        </div>
                      )}

                      <div className="flex flex-col gap-[8px] items-start"></div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '18px',
                        padding: '0 32px',
                      }}
                    >
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                              ? `Brasileir${handleGender}`
                              : `Estrangeir${handleGender}`
                            : 'Não Informado'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                          {handleTranslationGender(personalData.civil_status)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                          {handleCapacity()}
                        </span>
                      </div>

                      {personalData.represent && (
                        <div className="flex flex-col gap-[8px] items-start">
                          <span
                            style={{
                              color: '#344054',
                              fontSize: '20px',
                              fontWeight: '500',
                            }}
                          >
                            Representante
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#344054',
                              fontWeight: '400',
                            }}
                          >
                            <a
                              href={`/detalhes?type=cliente/representante&id=${personalData.represent.representor_id}`}
                              style={{
                                color: '#344054',
                              }}
                            >
                              <span className="underline">
                                {representorsList.map((representor: any) => {
                                  if (
                                    Number(representor.id) === personalData.represent.representor_id
                                  ) {
                                    return `${representor.id} - ${representor.attributes.name}`;
                                  }
                                })}
                              </span>
                            </a>
                          </span>
                        </div>
                      )}
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
                <div
                  className="flex"
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
                </div>
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
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '18px',
                        padding: '0 32px',
                      }}
                    >
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
                      <div className="flex flex-col gap-[8px] items-start">
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
                      </div>
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
                <div
                  className="flex"
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
                </div>
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
                      <div
                        className="flex"
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
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          {phoneNumbers}
                        </span>
                      </div>
                      <div
                        className="flex"
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
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          {EmailList}
                        </span>
                      </div>
                      <div
                        className="flex"
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
                      </div>
                      <div
                        className="flex"
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
                      </div>
                      <div
                        className="flex"
                        style={{
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'flex-start',
                          width: '220px',
                        }}
                      ></div>
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
                    <div
                      className="flex"
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
                    </div>
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
                          <div
                            className="flex"
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
                          </div>
                          <div
                            className="flex"
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
                          </div>
                          <div
                            className="flex"
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
                          </div>
                          <div
                            className="flex"
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
                          </div>
                          <div
                            className="flex"
                            style={{
                              flexDirection: 'column',
                              gap: '8px',
                              alignItems: 'flex-start',
                              width: '220px',
                            }}
                          ></div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '18px',
                            padding: '0 32px',
                          }}
                        >
                          <div
                            className="flex"
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
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          {type !== 'cliente/pessoa_juridica' && (
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
                  <div
                    className="flex"
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
                  </div>
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
                        <div
                          className="flex"
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
                        </div>
                        <div
                          className="flex"
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
                        </div>
                        <div
                          className="flex"
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
                        </div>
                        <div
                          className="flex"
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
                        </div>
                        <div
                          className="flex"
                          style={{
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start',
                            width: '220px',
                          }}
                        ></div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: '18px',
                          padding: '0 32px',
                        }}
                      >
                        <div
                          className="flex"
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
                        </div>
                        <div
                          className="flex"
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
                        </div>
                      </div>
                    </div>
                  )}
                </>
              </ContainerDetails>
            </DetailsWrapper>
          )}
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
