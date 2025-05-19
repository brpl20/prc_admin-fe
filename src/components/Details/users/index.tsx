import { useEffect, useState } from 'react';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import { Box, Button, CircularProgress } from '@mui/material';
import { getProfileAdminById } from '@/services/admins';
import { getAllOffices } from '@/services/offices';
import {
  FiMinusCircle,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiMail,
  FiFileText,
} from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';

import { phoneMask } from '@/utils/masks';
import { IProfileAdmin } from '@/interfaces/IAdmin';

interface UserDetailsProps {
  id: string | string[];
}

interface IUserDetails {
  name: string;
  last_name: string;
  birth: string;
  civil_status: string;
  cpf: string;
  rg: string;
  role: string;
  status: string;
  email: string;
  origin: string;
  office_id: number | null;
  oab: string;
  mother_name: string;
  nationality: string;
  gender: string;

  addresses: Array<{
    zip_code: string;
    neighborhood: string;
    state: string;
    street: string;
    number: string;
    city: string;
  }>;

  bank_accounts: Array<{
    bank_name: string;
    agency: string;
    account: string;
    type_account: string;
    pix: string;
    operation: string;
  }>;

  emails: Array<{
    email: string;
  }>;
  phones: Array<{
    phone_number: string;
  }>;
}

export default function UserDetails({ id }: UserDetailsProps) {
  const [userData, setUserData] = useState({} as IUserDetails);
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
    } = await getAllOffices('');
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

  const profileAdminToUserDetails = ({
    attributes: profileAdminAttributes,
  }: IProfileAdmin): IUserDetails => {
    const addresses =
      profileAdminAttributes.addresses?.map((address: any) => ({
        zip_code: address.zip_code ?? '',
        neighborhood: address.neighborhood ?? '',
        state: address.state ?? '',
        street: address.street ?? '',
        number: address.number?.toString() ?? '',
        city: address.city ?? '',
      })) ?? [];

    const bankAccounts =
      profileAdminAttributes.bank_accounts?.map((account: any) => ({
        bank_name: account.bank_name ?? '',
        agency: account.agency ?? '',
        account: account.account ?? '',
        type_account: account.type_account ?? '',
        pix: account.pix ?? '',
        operation: account.operation ?? '',
      })) ?? [];

    const emails =
      profileAdminAttributes.emails?.map((email: any) => ({
        email: email.email ?? '',
      })) ?? [];

    const phones =
      profileAdminAttributes.phones?.map((phone: any) => ({
        phone_number: phone.phone_number ?? '',
      })) ?? [];

    return {
      name: profileAdminAttributes.name ?? '',
      last_name: profileAdminAttributes.last_name ?? '',
      birth: profileAdminAttributes.birth ?? '',
      civil_status: profileAdminAttributes.civil_status ?? '',
      cpf: profileAdminAttributes.cpf ?? '',
      rg: profileAdminAttributes.rg ?? '',
      role: profileAdminAttributes.role ?? '',
      status: profileAdminAttributes.status ?? '',
      email: profileAdminAttributes.email ?? '',
      origin: profileAdminAttributes.origin ?? '',
      office_id: profileAdminAttributes.office_id,
      oab: profileAdminAttributes.oab ?? '',
      mother_name: profileAdminAttributes.mother_name ?? '',
      nationality: profileAdminAttributes.nationality ?? '',
      gender: profileAdminAttributes.gender ?? '',
      addresses,
      bank_accounts: bankAccounts,
      emails,
      phones,
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await getProfileAdminById(id as string);

      if (data) {
        const loadedUser = profileAdminToUserDetails(data);
        setUserData(loadedUser);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const emailList =
    userData.emails && userData.emails.length > 0
      ? userData.emails.map((phone, index) => (
          <span key={index} style={{ display: 'block' }}>
            {phone.email}
          </span>
        ))
      : 'Não Informado';

  const phoneNumbers =
    userData.phones && userData.phones.length > 0
      ? userData.phones.map((phone, index) => (
          <span key={index} style={{ display: 'block' }}>
            {phoneMask(phone.phone_number)}
          </span>
        ))
      : 'Não Informado';

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
                <div
                  className="flex bg-white"
                  style={{
                    padding: '20px 32px 20px 32px',
                    borderBottom: '1px solid #C0C0C0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiUser size={24} color="#344054" />

                    <div className="w-[2px] bg-gray-300 h-8" />

                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Dados Pessoais
                    </span>
                  </div>

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
                              ? 'Solteiro'
                              : userData.civil_status === 'union'
                              ? 'União Estável'
                              : userData.civil_status === 'married'
                              ? 'Casado'
                              : userData.civil_status === 'divorced'
                              ? 'Divorciado'
                              : userData.civil_status === 'widower'
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
                <div
                  className="flex bg-white"
                  style={{
                    padding: '20px 32px 20px 32px',
                    borderBottom: '1px solid #C0C0C0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiMapPin size={24} color="#344054" />

                    <div className="w-[2px] bg-gray-300 h-8" />
                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Endereço
                    </span>
                  </div>

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
                </div>
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
                  className="flex bg-white"
                  style={{
                    padding: '20px 32px 20px 32px',
                    borderBottom: '1px solid #C0C0C0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiMail size={24} color="#344054" />

                    <div className="w-[2px] bg-gray-300 h-8" />

                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Contato
                    </span>
                  </div>

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
                </div>
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
                          {phoneNumbers}
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
                          {emailList}
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
                  className="flex bg-white"
                  style={{
                    padding: '20px 32px 20px 32px',
                    borderBottom: '1px solid #C0C0C0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiFileText size={24} color="#344054" />

                    <div className="w-[2px] bg-gray-300 h-8" />

                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Dados Gerais
                    </span>
                  </div>

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
                </div>
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
                          {userData.role === 'lawyer'
                            ? 'Advogado'
                            : userData.role === 'paralegal'
                            ? 'Paralegal'
                            : userData.role === 'trainee'
                            ? 'Estagiário'
                            : userData.role === 'secretary'
                            ? 'Secretário(a)'
                            : userData.role === 'counter'
                            ? 'Contador(a)'
                            : ''}
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
                <div
                  className="flex bg-white"
                  style={{
                    padding: '20px 32px 20px 32px',
                    borderBottom: '1px solid #C0C0C0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiDollarSign size={24} color="#344054" />

                    <div className="w-[2px] bg-gray-300 h-8" />

                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Dados Bancários
                    </span>
                  </div>

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
                </div>
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
                <div
                  className="flex bg-white"
                  style={{
                    padding: '20px 32px 20px 32px',
                    borderBottom: '1px solid #C0C0C0',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiAlertCircle size={24} color="#344054" />

                    <div className="w-[2px] bg-gray-300 h-8" />

                    <span
                      style={{
                        fontSize: '22px',
                        fontWeight: '500',
                        color: '#344054',
                      }}
                    >
                      Acesso ao Sistema
                    </span>
                  </div>

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
                </div>
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
