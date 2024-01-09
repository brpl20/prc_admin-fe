import { getOfficeById } from '@/services/offices';

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
} from '../styles';
import { cnpjMask, phoneMask } from '@/utils/masks';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { CircularProgress } from '@mui/material';
import Link from 'next/link';
import { IAdminProps } from '@/interfaces/IAdmin';
import { getAllCustomers } from '@/services/customers';

interface OfficeDetailsProps {
  id: string | string[];
}

export default function OfficeDetails({ id }: OfficeDetailsProps) {
  const [allLawyers, SetAllLawyers] = useState<any>([]);

  const [officeData, setOfficeData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [officeTypeIsOpen, setOfficeTypeIsOpen] = useState(true);
  const [officeInfoIsOpen, setOfficeInfoIsOpen] = useState(true);
  const [officeAddressIsOpen, setOfficeAddressIsOpen] = useState(true);
  const [officeContactIsOpen, setOfficeContactIsOpen] = useState(true);
  const [officeAdicionalInfoIsOpen, setOfficeAdicionalInfoIsOpen] = useState(true);

  const getAdmins = async () => {
    const response: {
      data: IAdminProps[];
    } = await getAllCustomers();
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
          responsible_lawyer: data.attributes.responsible_lawyer_id
            ? getLawyerName(data.attributes.responsible_lawyer_id)
            : '',
        };

        setOfficeData(newData);
      }
    } catch (error) {
      console.log(error);
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
        <span
          style={{
            fontSize: '32px',
            fontWeight: '500',
            color: '#2A3F54',
          }}
        >
          Escritório {officeData.name}
        </span>
      </Flex>

      <Flex
        style={{
          borderBottom: '1px solid #2A3F54',
        }}
      ></Flex>

      <ContainerDetails>
        <Box>
          <Flex
            style={{
              justifyContent: 'space-between',
              alignItems: 'start',
              cursor: 'pointer',
            }}
            onClick={() => setOfficeTypeIsOpen(!officeTypeIsOpen)}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#2A3F54',
                minWidth: '350px',
              }}
            >
              Informações sobre o Tipo
            </span>
            {officeTypeIsOpen && (
              <GridInfo>
                <BoxInfo>
                  <strong
                    style={{
                      fontSize: '20px',
                      fontWeight: '500',
                      color: '#2A3F54',
                    }}
                  >
                    Tipo de Escritório:
                  </strong>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: '400',
                      color: '#000',
                    }}
                  >
                    {officeData.office_type_description}
                  </span>
                </BoxInfo>
              </GridInfo>
            )}
            <ButtonShowData onClick={() => setOfficeTypeIsOpen(!officeTypeIsOpen)}>
              <MdKeyboardArrowDown
                style={{
                  fontSize: '24px',
                  color: '#2A3F54',
                }}
              />
            </ButtonShowData>
          </Flex>
        </Box>

        <Box>
          <Flex
            style={{
              borderBottom: '1px solid #2A3F54',
            }}
          ></Flex>

          <Flex
            style={{
              justifyContent: 'space-between',
              alignItems: 'start',
              cursor: 'pointer',
              paddingTop: '32px',
            }}
            onClick={() => setOfficeInfoIsOpen(!officeInfoIsOpen)}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#2A3F54',
                minWidth: '350px',
              }}
            >
              Informações do Escritório
            </span>
            {officeInfoIsOpen && (
              <Flex
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Nome:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.name}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      OAB:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.oab}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      CNPJ/CPF:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.cnpj ? cnpjMask(officeData.cnpj) : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Tipo de Sociedade:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.society}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Data de Função EXP. OAB:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.foundation
                        ? officeData.foundation.split('-').reverse().join('/')
                        : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Flex>
            )}
            <ButtonShowData onClick={() => setOfficeTypeIsOpen(!officeTypeIsOpen)}>
              <MdKeyboardArrowDown
                style={{
                  fontSize: '24px',
                  color: '#2A3F54',
                }}
              />
            </ButtonShowData>
          </Flex>
        </Box>

        <Box>
          <Flex
            style={{
              borderBottom: '1px solid #2A3F54',
            }}
          ></Flex>

          <Flex
            style={{
              justifyContent: 'space-between',
              alignItems: 'start',
              cursor: 'pointer',
              paddingTop: '32px',
            }}
            onClick={() => setOfficeAddressIsOpen(!officeAddressIsOpen)}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#2A3F54',
                minWidth: '350px',
              }}
            >
              Endereço
            </span>
            {officeAddressIsOpen && (
              <Flex
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      CEP:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.cep}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Bairro:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.neighborhood}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Estado:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.state}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Endereço:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.street}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Número:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.number}
                    </span>
                  </BoxInfo>
                </GridInfo>
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Cidade:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.city}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Complemento:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      Sem complemento
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Flex>
            )}
            <ButtonShowData onClick={() => setOfficeTypeIsOpen(!officeTypeIsOpen)}>
              <MdKeyboardArrowDown
                style={{
                  fontSize: '24px',
                  color: '#2A3F54',
                }}
              />
            </ButtonShowData>
          </Flex>
        </Box>

        <Box>
          <Flex
            style={{
              borderBottom: '1px solid #2A3F54',
            }}
          ></Flex>

          <Flex
            style={{
              justifyContent: 'space-between',
              alignItems: 'start',
              cursor: 'pointer',
              paddingTop: '32px',
            }}
            onClick={() => setOfficeContactIsOpen(!officeContactIsOpen)}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#2A3F54',
                minWidth: '350px',
              }}
            >
              Contato
            </span>
            {officeContactIsOpen && (
              <Flex
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Telefone:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.phones
                        ? officeData.phones
                            .map((phone: any) => phoneMask(phone.phone_number))
                            .join(', ')
                        : ''}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      E-mail Oficial:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.emails
                        ? officeData.emails.map((email: any) => email.email).join(', ')
                        : ''}
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Flex>
            )}
            <ButtonShowData onClick={() => setOfficeTypeIsOpen(!officeTypeIsOpen)}>
              <MdKeyboardArrowDown
                style={{
                  fontSize: '24px',
                  color: '#2A3F54',
                }}
              />
            </ButtonShowData>
          </Flex>
        </Box>

        <Box>
          <Flex
            style={{
              borderBottom: '1px solid #2A3F54',
            }}
          ></Flex>

          <Flex
            style={{
              justifyContent: 'space-between',
              alignItems: 'start',
              cursor: 'pointer',
              paddingTop: '32px',
            }}
            onClick={() => setOfficeAdicionalInfoIsOpen(!officeAdicionalInfoIsOpen)}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#2A3F54',
                minWidth: '350px',
              }}
            >
              Informações Adicionais
            </span>
            {officeAdicionalInfoIsOpen && (
              <Flex
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <GridInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Site:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.site}
                    </span>
                  </BoxInfo>
                  <BoxInfo>
                    <strong
                      style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#2A3F54',
                      }}
                    >
                      Responsável pelo Escritório:
                    </strong>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000',
                      }}
                    >
                      {officeData.responsible_lawyer}
                    </span>
                  </BoxInfo>
                </GridInfo>
              </Flex>
            )}
            <ButtonShowData onClick={() => setOfficeTypeIsOpen(!officeTypeIsOpen)}>
              <MdKeyboardArrowDown
                style={{
                  fontSize: '24px',
                  color: '#2A3F54',
                }}
              />
            </ButtonShowData>
          </Flex>
        </Box>

        <Box>
          <Flex
            style={{
              borderBottom: '1px solid #2A3F54',
            }}
          ></Flex>

          <Flex
            style={{
              justifyContent: 'flex-end',
              alignItems: 'start',
              padding: '32px 0px 0px 0px',
            }}
          >
            <Link href="/escritorios" legacyBehavior>
              <a
                style={{
                  fontSize: '18px',
                  width: '100px',
                  height: '36px',
                  background: '#fff',
                  color: '#2A3F54',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: '1px solid #2A3F54',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                Fechar
              </a>
            </Link>
          </Flex>
        </Box>
      </ContainerDetails>
    </DetailsWrapper>
  );
}
