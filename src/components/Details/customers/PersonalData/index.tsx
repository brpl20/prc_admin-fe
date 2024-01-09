import { getCustomerById } from '@/services/customers';
import { useEffect, useState } from 'react';

import {
  Title,
  ButtonShowData,
  ContainerDetails,
  Flex,
  Box,
  DetailsWrapper,
  BoxInfo,
  GridInfo,
  ButtonShowContact,
} from '../../styles';
import { cnpjMask, cpfMask, phoneMask, rgMask } from '@/utils/masks';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { CircularProgress } from '@mui/material';

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
}

const PersonalData = ({ id, type }: PersonalDataProps) => {
  const [personalData, setPersonalData] = useState({} as PersonalData);
  const [isOpen, setIsOpen] = useState(true);
  const [emailIsOpen, setEmailIsOpen] = useState(false);
  const [phoneIsOpen, setPhoneIsOpen] = useState(false);
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

        const commonData = {
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
        };

        let specificData;

        switch (data.attributes.customer_type) {
          case 'physical_person':
            specificData = {
              cpf: data.attributes.cpf ? cpfMask(data.attributes.cpf) : 'Não Informado',
              rg: data.attributes.rg ? rgMask(data.attributes.rg) : 'Não Informado',
            };
            break;

          case 'legal_person':
            specificData = {
              cnpj: data.attributes.cnpj ? data.attributes.cnpj : 'Não Informado',
              rg: data.attributes.rg ? rgMask(data.attributes.rg) : 'Não Informado',
            };
            break;

          case 'counter':
            specificData = {
              accountant_id: data.attributes.accountant_id
                ? data.attributes.accountant_id
                : 'Não Informado',
            };
            break;

          case 'representative':
            specificData = {
              birth: data.attributes.birth ? data.attributes.birth : 'Não Informado',
              cpf: data.attributes.cpf ? cpfMask(data.attributes.cpf) : 'Não Informado',
              rg: data.attributes.rg ? rgMask(data.attributes.rg) : 'Não Informado',
              civil_status: data.attributes.civil_status
                ? data.attributes.civil_status
                : 'Não Informado',
              nationality: data.attributes.nationality ? data.attributes.nationality : '',
              gender: data.attributes.gender ? data.attributes.gender : '',
            };
            break;

          default:
            break;
        }

        setPersonalData({ ...commonData, ...specificData } as PersonalData);
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
    <DetailsWrapper>
      {loading && (
        <Flex
          style={{
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Flex>
      )}

      <Flex>
        <ButtonShowData
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              fontWeight: '500',
            }}
          >
            {personalData.name ? personalData.name : ''}{' '}
            {personalData.last_name ? personalData.last_name : ''}
          </span>
          <MdKeyboardArrowDown
            style={{
              fontSize: '1.5rem',
              transition: 'all 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            size={24}
          />
        </ButtonShowData>
      </Flex>

      {isOpen && (
        <ContainerDetails>
          {type?.includes('pessoa_fisica') && (
            <>
              <Box
                style={{
                  gap: '16px',
                }}
              >
                <GridInfo
                  style={{
                    rowGap: '16px',
                  }}
                >
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Nome Completo
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >{`${personalData.name ? personalData.name : ''} ${
                      personalData.last_name ? personalData.last_name : ''
                    }`}</span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Data de Nascimento
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.birth
                        ? personalData.birth.split('-').reverse().join('/')
                        : 'Não Informado'}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Naturalidade
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.nationality ? personalData.nationality : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Estado Civil
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.civil_status}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Capacidade
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.capacity}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <GridInfo
                  style={{
                    rowGap: '16px',
                  }}
                >
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      CPF
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.cpf ? cpfMask(personalData.cpf) : 'Não Informado'}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      RG
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.rg ? rgMask(personalData.rg) : 'Não Informado'}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Genero
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.gender}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Estado
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.state}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Cidade
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.city}
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Box>

              <Box
                style={{
                  gap: '16px',
                  borderBottom: '1px solid #2A3F54',
                  paddingBottom: '32px',
                }}
              >
                <GridInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Endereço
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.street}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Numero
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.number}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span
                      style={{
                        color: '#526B8E',
                        fontSize: '20px',
                      }}
                    >
                      Bairro
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#121214',
                        fontWeight: '500',
                      }}
                    >
                      {personalData.neighborhood}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <BoxInfo>
                  <span
                    style={{
                      color: '#526B8E',
                      fontSize: '20px',
                    }}
                  >
                    Descrição
                  </span>
                  <span
                    style={{
                      fontSize: '18px',
                      color: '#121214',
                      fontWeight: '500',
                    }}
                  >
                    {personalData.description}
                  </span>
                </BoxInfo>
              </Box>

              <Box>
                <ButtonShowContact onClick={() => setEmailIsOpen(!emailIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Emails{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: emailIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {emailIsOpen && (
                  <GridInfo>
                    {personalData.emails.map(email => (
                      <BoxInfo key={email.email}>
                        <span
                          style={{
                            width: '200px',
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {email.email}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ButtonShowContact onClick={() => setPhoneIsOpen(!phoneIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Telefones{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: phoneIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {phoneIsOpen && (
                  <GridInfo>
                    {personalData.phones.map(phone => (
                      <BoxInfo key={phone.phone_number}>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {phoneMask(phone.phone_number)}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>
            </>
          )}

          {type?.includes('pessoa_juridica') && (
            <>
              <Box
                style={{
                  gap: '16px',
                }}
              >
                <GridInfo
                  style={{
                    rowGap: '16px',
                  }}
                >
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Nome Completo</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {`${personalData.name ? personalData.name : ''} ${
                        personalData.last_name ? personalData.last_name : ''
                      }`}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Data de Nascimento</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.birth
                        ? personalData.birth.split('-').reverse().join('/')
                        : 'Não Informado'}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Naturalidade</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.nationality ? personalData.nationality : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Estado Civil</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.civil_status ? personalData.civil_status : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Capacidade</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.capacity ? personalData.capacity : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <GridInfo
                  style={{
                    rowGap: '16px',
                  }}
                >
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>CNPJ</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.cnpj ? cnpjMask(personalData.cnpj) : 'Não Informado'}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>RG</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.rg ? rgMask(personalData.rg) : 'Não Informado'}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Genero</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.gender ? personalData.gender : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Estado</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.state ? personalData.state : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Cidade</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.city ? personalData.city : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Box>

              <Box
                style={{
                  gap: '16px',
                  borderBottom: '1px solid #2A3F54',
                  paddingBottom: '32px',
                }}
              >
                <GridInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Endereço</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.street ? personalData.street : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Numero</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.number ? personalData.number : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Bairro</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.neighborhood ? personalData.neighborhood : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <BoxInfo>
                  <span style={{ color: '#526B8E', fontSize: '20px' }}>Descrição</span>
                  <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                    {personalData.description ? personalData.description : ''}
                  </span>
                </BoxInfo>
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ButtonShowContact onClick={() => setEmailIsOpen(!emailIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Emails{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: emailIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {emailIsOpen && (
                  <GridInfo>
                    {personalData.emails.map(email => (
                      <BoxInfo key={email.email}>
                        <span
                          style={{
                            width: '200px',
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {email.email}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ButtonShowContact onClick={() => setPhoneIsOpen(!phoneIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Telefones{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: phoneIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {phoneIsOpen && (
                  <GridInfo>
                    {personalData.phones.map(phone => (
                      <BoxInfo key={phone.phone_number}>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {phoneMask(phone.phone_number)}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>
            </>
          )}

          {type?.includes('contador') && (
            <>
              <Box>
                <GridInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Nome Completo</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {`${personalData.name ? personalData.name : ''} ${
                        personalData.last_name ? personalData.last_name : ''
                      }`}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Registro</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.accountant_id ? personalData.accountant_id : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ButtonShowContact onClick={() => setEmailIsOpen(!emailIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Emails{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: emailIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {emailIsOpen && (
                  <GridInfo>
                    {personalData.emails.map(email => (
                      <BoxInfo key={email.email}>
                        <span
                          style={{
                            width: '200px',
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {email.email}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ButtonShowContact onClick={() => setPhoneIsOpen(!phoneIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Telefones{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: phoneIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {phoneIsOpen && (
                  <GridInfo>
                    {personalData.phones.map(phone => (
                      <BoxInfo key={phone.phone_number}>
                        <span
                          style={{
                            width: '200px',
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {phoneMask(phone.phone_number)}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>
            </>
          )}

          {type?.includes('representante') && (
            <>
              <Box
                style={{
                  gap: '16px',
                }}
              >
                <GridInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Nome Completo</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {`${personalData.name ? personalData.name : ''} ${
                        personalData.last_name ? personalData.last_name : ''
                      }`}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>CPF</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.cpf ? cpfMask(personalData.cpf) : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>RG</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.rg ? personalData.rg : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <GridInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Data de Nascimento</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.birth
                        ? personalData.birth.split('-').reverse().join('/')
                        : 'Não Informado'}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Estado Civil</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.civil_status
                        ? personalData.civil_status === 'single'
                          ? 'Solteiro(a)'
                          : personalData.civil_status === 'married'
                          ? 'Casado(a)'
                          : personalData.civil_status === 'divorced'
                          ? 'Divorciado(a)'
                          : personalData.civil_status === 'widower'
                          ? 'Viúvo(a)'
                          : ''
                        : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <span style={{ color: '#526B8E', fontSize: '20px' }}>Gênero</span>
                    <span style={{ fontSize: '18px', color: '#121214', fontWeight: '500' }}>
                      {personalData.gender
                        ? personalData.gender === 'male'
                          ? 'Masculino'
                          : 'Feminino'
                        : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ButtonShowContact onClick={() => setEmailIsOpen(!emailIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Emails{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: emailIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {emailIsOpen && (
                  <GridInfo>
                    {personalData.emails.map(email => (
                      <BoxInfo key={email.email}>
                        <span
                          style={{
                            width: '200px',
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {email.email}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ButtonShowContact onClick={() => setPhoneIsOpen(!phoneIsOpen)}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Telefones{' '}
                    <MdKeyboardArrowDown
                      style={{
                        fontSize: '1.5rem',
                        transition: 'all 0.2s',
                        transform: phoneIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      size={24}
                    />
                  </span>
                </ButtonShowContact>
                {phoneIsOpen && (
                  <GridInfo>
                    {personalData.phones.map(phone => (
                      <BoxInfo key={phone.phone_number}>
                        <span
                          style={{
                            width: '200px',
                            fontSize: '18px',
                            color: '#121214',
                            fontWeight: '500',
                          }}
                        >
                          {phoneMask(phone.phone_number)}
                        </span>
                      </BoxInfo>
                    ))}
                  </GridInfo>
                )}
              </Box>
            </>
          )}
        </ContainerDetails>
      )}
    </DetailsWrapper>
  );
};

export default PersonalData;
