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
import { getAdminByID } from '@/services/admins';
import { getAllOffices } from '@/services/offices';

interface UserDetailsProps {
  id: string | string[];
}

export default function UserDetails({ id }: UserDetailsProps) {
  const [userData, setUserData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [personalDataIsOpen, setPersonalDataIsOpen] = useState(true);
  const [userAddressIsOpen, setUserAddressIsOpen] = useState(true);
  const [userContactIsOpen, setUserContactIsOpen] = useState(true);
  const [userGeneralData, setUserGeneralData] = useState(true);
  const [userBankDataIsOpen, setUserBankDataIsOpen] = useState(true);
  const [userAccessDataIsOpen, setUserAccessDataIsOpen] = useState(true);

  const [allOffices, setAllOffices] = useState<any[]>([]);

  const getOffices = async () => {
    const response: {
      data: any;
    } = await getAllOffices();
    setAllOffices(response.data);
  };

  const getOfficeName = (officeId: number) => {
    if (officeId) {
      const lawyer = allOffices.find((lawyer: any) => lawyer.id == officeId);
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
      const { data } = await getAdminByID(id as string);

      if (data) {
        const addresses = data.data.attributes.addresses.map((address: any) => {
          return {
            zip_code: address.zip_code ? address.zip_code : '',
            neighborhood: address.neighborhood ? address.neighborhood : '',
            state: address.state ? address.state : '',
            street: address.street ? address.street : '',
            number: address.number ? address.number : '',
            city: address.city ? address.city : '',
          };
        });

        const bankAccounts = data.data.attributes.bank_accounts.map((bankAccount: any) => {
          return {
            bank_name: bankAccount.bank_name ? bankAccount.bank_name : '',
            agency: bankAccount.agency ? bankAccount.agency : '',
            account: bankAccount.account ? bankAccount.account : '',
            type_account: bankAccount.type_account ? bankAccount.type_account : '',
            pix: bankAccount.pix ? bankAccount.pix : '',
            operation: bankAccount.operation ? bankAccount.operation : '',
          };
        });

        const newData = {
          name: data.data.attributes.name ? data.data.attributes.name : '',
          last_name: data.data.attributes.last_name ? data.data.attributes.last_name : '',
          birth: data.data.attributes.birth ? data.data.attributes.birth : '',
          civil_status: data.data.attributes.civil_status ? data.data.attributes.civil_status : '',
          cpf: data.data.attributes.cpf ? data.data.attributes.cpf : '',
          rg: data.data.attributes.rg ? data.data.attributes.rg : '',
          role: data.data.attributes.role ? data.data.attributes.role : '',
          status: data.data.attributes.status ? data.data.attributes.status : '',
          email: data.data.attributes.email ? data.data.attributes.email : '',
          emails: data.data.attributes.emails ? data.data.attributes.emails : '',
          phones: data.data.attributes.phones ? data.data.attributes.phones : '',
          addresses: addresses ? addresses : '',
          bank_accounts: bankAccounts ? bankAccounts : '',
          gender: data.data.attributes.gender ? data.data.attributes.gender : '',
          mother_name: data.data.attributes.mother_name ? data.data.attributes.mother_name : '',
          nationality: data.data.attributes.nationality ? data.data.attributes.nationality : '',
          office_id: data.data.attributes.office_id ? data.data.attributes.office_id : '',
        };

        setUserData(newData);
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
  }, []);

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
      {userData && (
        <>
          <Flex>
            <span
              style={{
                fontSize: '32px',
                fontWeight: '500',
                color: '#2A3F54',
              }}
            >
              Usuário {userData.name}
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
                onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: '500',
                    color: '#2A3F54',
                    minWidth: '350px',
                  }}
                >
                  Dados Pessoais
                </span>
                {personalDataIsOpen && (
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
                          {userData.name}
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
                          Sobrenome:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.last_name}
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
                          CPF:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.cpf}
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
                          RG:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.rg}
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
                          Data de Nascimento:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.birth}
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
                          Nome da Mãe:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.mother_name}
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
                          Naturalidade:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.nationality}
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
                          Gênero:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.gender}
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
                          Estado Civil:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.civil_status}
                        </span>
                      </BoxInfo>
                    </GridInfo>
                  </Flex>
                )}
                <ButtonShowData onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}>
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
                onClick={() => setUserAddressIsOpen(!userAddressIsOpen)}
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
                {userAddressIsOpen && (
                  <Flex
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    {userData.addresses &&
                      userData.addresses.map((address: any, index: any) => (
                        <Flex
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                          key={index}
                        >
                          <GridInfo key={index}>
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
                                {address.zip_code}
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
                                {address.neighborhood}
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
                                {address.state}
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
                                {address.street}
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
                                {address.number}
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
                                {address.city}
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
                      ))}
                  </Flex>
                )}
                <ButtonShowData onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}>
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
                onClick={() => setUserContactIsOpen(!userContactIsOpen)}
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
                {userContactIsOpen && (
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
                          {userData.phones
                            ? userData.phones
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
                          {userData.emails
                            ? userData.emails.map((email: any) => email.email).join(', ')
                            : ''}
                        </span>
                      </BoxInfo>
                    </GridInfo>
                  </Flex>
                )}
                <ButtonShowData onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}>
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
                onClick={() => setUserGeneralData(!userGeneralData)}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: '500',
                    color: '#2A3F54',
                    minWidth: '350px',
                  }}
                >
                  Dados Gerais
                </span>
                {userGeneralData && (
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
                          Origin:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.name}
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
                          Tipo:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.role}
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
                          Escritório:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {getOfficeName(userData.office_id)}
                        </span>
                      </BoxInfo>
                    </GridInfo>
                  </Flex>
                )}
                <ButtonShowData onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}>
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
                onClick={() => setUserBankDataIsOpen(!userBankDataIsOpen)}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: '500',
                    color: '#2A3F54',
                    minWidth: '350px',
                  }}
                >
                  Dados Bancarios
                </span>
                {userBankDataIsOpen && (
                  <Flex
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    {userData.bank_accounts &&
                      userData.bank_accounts.map((bankAccount: any, index: any) => (
                        <Flex
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                          key={index}
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
                                Banco:
                              </strong>
                              <span
                                style={{
                                  fontSize: '18px',
                                  fontWeight: '400',
                                  color: '#000',
                                }}
                              >
                                {bankAccount.bank_name}
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
                                Agência:
                              </strong>
                              <span
                                style={{
                                  fontSize: '18px',
                                  fontWeight: '400',
                                  color: '#000',
                                }}
                              >
                                {bankAccount.agency}
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
                                Operação:
                              </strong>
                              <span
                                style={{
                                  fontSize: '18px',
                                  fontWeight: '400',
                                  color: '#000',
                                }}
                              >
                                {bankAccount.operation}
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
                                Conta:
                              </strong>
                              <span
                                style={{
                                  fontSize: '18px',
                                  fontWeight: '400',
                                  color: '#000',
                                }}
                              >
                                {bankAccount.account}
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
                                Chave Pix:
                              </strong>
                              <span
                                style={{
                                  fontSize: '18px',
                                  fontWeight: '400',
                                  color: '#000',
                                }}
                              >
                                {bankAccount.pix}
                              </span>
                            </BoxInfo>
                          </GridInfo>
                        </Flex>
                      ))}
                  </Flex>
                )}
                <ButtonShowData onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}>
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
                onClick={() => setUserAccessDataIsOpen(!userAccessDataIsOpen)}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: '500',
                    color: '#2A3F54',
                    minWidth: '350px',
                  }}
                >
                  Acesso ao Sistema
                </span>
                {userAccessDataIsOpen && (
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
                          E-mail:
                        </strong>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000',
                          }}
                        >
                          {userData.email}
                        </span>
                      </BoxInfo>
                    </GridInfo>
                  </Flex>
                )}
                <ButtonShowData onClick={() => setPersonalDataIsOpen(!personalDataIsOpen)}>
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
                <Link href="/usuarios" legacyBehavior>
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
        </>
      )}
    </DetailsWrapper>
  );
}
