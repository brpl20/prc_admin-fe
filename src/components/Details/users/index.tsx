import { useEffect, useState } from 'react';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import { Box, Button, CircularProgress } from '@mui/material';
import { getAdminByID } from '@/services/admins';
import { getAllOffices } from '@/services/offices';
import { FiMinusCircle } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';

interface UserDetailsProps {
  id: string | string[];
}

export default function UserDetails({ id }: UserDetailsProps) {
  const [userData, setUserData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [personalDataIsOpen, setPersonalDataIsOpen] = useState(true);
  const [userAddressIsOpen, setUserAddressIsOpen] = useState(true);
  const [userContactIsOpen, setUserContactIsOpen] = useState(true);
  const [userGeneralData, setUserGeneralData] = useState(false);
  const [userBankDataIsOpen, setUserBankDataIsOpen] = useState(false);
  const [userAccessDataIsOpen, setUserAccessDataIsOpen] = useState(false);

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
          origin: data.data.attributes.origin ? data.data.attributes.origin : '',
          oab: data.data.attributes.oab ? data.data.attributes.oab : '',
        };

        setUserData(newData);
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

      {!loading && userData && (
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
                          Nome
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {`${userData.name ? userData.name : ''} ${
                            userData.last_name ? userData.last_name : ''
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
                          CPF
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.cpf ? userData.cpf : 'Não Informado'}
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
                          RG
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.rg ? userData.rg : 'Não Informado'}
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
                          Data de Nascimento
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                          }}
                        >
                          {userData.birth
                            ? userData.birth.split('-').reverse().join('/')
                            : 'Não Informado'}
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
                          Nome da Mãe
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.mother_name ? userData.mother_name : 'Não Informado'}
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
                          {userData.nationality
                            ? userData.nationality === 'brazilian'
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
                          {userData.civil_status
                            ? userData.civil_status === 'single'
                              ? 'Solteiro(a)'
                              : userData.civil_status === 'married'
                              ? 'Casado(a)'
                              : userData.civil_status === 'divorced'
                              ? 'Divorciado(a)'
                              : userData.civil_status === 'widower'
                              ? 'Viúvo(a)'
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
                          {userData.gender
                            ? userData.gender === 'male'
                              ? 'Masculino'
                              : 'Feminino'
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
                    {userAddressIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserAddressIsOpen(!userAddressIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserAddressIsOpen(!userAddressIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {userAddressIsOpen && (
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
                          {userData.addresses &&
                          userData.addresses[0] &&
                          userData.addresses[0].street
                            ? userData.addresses[0].street
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
                          Número
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.addresses &&
                          userData.addresses[0] &&
                          userData.addresses[0].number
                            ? userData.addresses[0].number
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
                          {userData.addresses &&
                          userData.addresses[0] &&
                          userData.addresses[0].zip_code
                            ? userData.addresses[0].zip_code
                            : 'Não Informado'}
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
                          {userData.addresses && userData.addresses[0] && userData.addresses[0].city
                            ? userData.addresses[0].city
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
                          Bairro
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.addresses &&
                          userData.addresses[0] &&
                          userData.addresses[0].neighborhood
                            ? userData.addresses[0].neighborhood
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
                          Estado
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.addresses &&
                          userData.addresses[0] &&
                          userData.addresses[0].state
                            ? userData.addresses[0].state
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
                    {userContactIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserContactIsOpen(!userContactIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserContactIsOpen(!userContactIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {userContactIsOpen && (
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
                            userData.phones && userData.phones[0] && userData.phones[0].phone_number
                              ? userData.phones[0].phone_number
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
                            userData.emails && userData.emails[0] && userData.emails[0].email
                              ? userData.emails[0].email
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
                    Dados Gerais
                  </span>
                  <ButtonShowContact>
                    {userGeneralData ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserGeneralData(!userGeneralData)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserGeneralData(!userGeneralData)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {userGeneralData && (
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
                          Origem
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.origin ? userData.origin : 'Não Informado'}
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
                          Perfil
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.role ? userData.role : 'Não Informado'}
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
                          Escritório
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.office_id ? getOfficeName(userData.office_id) : 'Não Informado'}
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
                          OAB
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.oab ? userData.oab : 'Não Informado'}
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
                    Dados Bancários
                  </span>
                  <ButtonShowContact>
                    {userBankDataIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserBankDataIsOpen(!userBankDataIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserBankDataIsOpen(!userBankDataIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {userBankDataIsOpen && (
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
                          {userData.bank_accounts &&
                          userData.bank_accounts[0] &&
                          userData.bank_accounts[0].bank_name
                            ? userData.bank_accounts[0].bank_name
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
                          {userData.bank_accounts &&
                          userData.bank_accounts[0] &&
                          userData.bank_accounts[0].agency
                            ? userData.bank_accounts[0].agency
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
                          {userData.bank_accounts &&
                          userData.bank_accounts[0] &&
                          userData.bank_accounts[0].operation
                            ? userData.bank_accounts[0].operation
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
                          {userData.bank_accounts &&
                          userData.bank_accounts[0] &&
                          userData.bank_accounts[0].account
                            ? userData.bank_accounts[0].account
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
                          {userData.bank_accounts &&
                          userData.bank_accounts[0] &&
                          userData.bank_accounts[0].pix
                            ? userData.bank_accounts[0].pix
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
                    Acesso ao Sistema
                  </span>
                  <ButtonShowContact>
                    {userAccessDataIsOpen ? (
                      <FiMinusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserAccessDataIsOpen(!userAccessDataIsOpen)}
                      />
                    ) : (
                      <GoPlusCircle
                        size={24}
                        color="#344054"
                        onClick={() => setUserAccessDataIsOpen(!userAccessDataIsOpen)}
                      />
                    )}
                  </ButtonShowContact>
                </Flex>
                {userAccessDataIsOpen && (
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
                          E-mail
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {userData.email ? userData.email : 'Não Informado'}
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
            window.location.href = '/usuarios';
          }}
        >
          {'Fechar'}
        </Button>
      </Box>
    </div>
  );
}
