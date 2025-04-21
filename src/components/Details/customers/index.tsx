import { getCustomerById, getAllProfileCustomer } from '@/services/customers';

import { useEffect, useState } from 'react';

import { ContainerDetails, DetailsWrapper, ButtonShowContact } from '../styles';
import {
  FiMinusCircle,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiMail,
} from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';
import { Box, Button, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';

import { phoneMask, cpfMask, rgMask } from '@/utils/masks';

interface PersonalDataProps {
  id: string | string[];
  type?: string | string[];
}

type BankAccountFields = 'bank_name' | 'agency' | 'operation' | 'account';

interface IPersonalData {
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

  const [personalData, setPersonalData] = useState({} as IPersonalData);
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

        setPersonalData(customerData as IPersonalData);
      }
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  const emailList =
    personalData.emails && personalData.emails.length > 0
      ? personalData.emails.map((email, index) => (
        <span key={index} style={{ display: 'block' }}>
          {email.email}
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
      const allCustomers = await getAllProfileCustomer('');
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
        <>
          {personalData.customer_type === 'counter' ? null : (
            <div className="flex flex-col gap-5">
              <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
                <ContainerDetails className="gap-[18px]">
                  <>
                    <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiUser size={24} color="#344054" />
                        <div className="w-[2px] h-8 bg-gray-300" />
                        <span className="text-[22px] font-medium text-[#344054]">
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
                      <div className="flex flex-col gap-[18px] pb-[20px]">
                        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                          <div className="flex flex-col gap-[8px] items-start">
                            <span className="text-[#344054] text-[20px] font-medium">Nome Completo</span>
                            <span className="text-[18px] text-[#344054] font-normal">
                              {`${personalData.name ? personalData.name : ''} ${personalData.last_name ? personalData.last_name : ''}`}
                            </span>
                          </div>

                          {(personalData.customer_type === 'physical_person' || personalData.customer_type === 'representative') && (
                            <div className="flex flex-col gap-[8px] items-start">
                              <span className="text-[#344054] text-[20px] font-medium">CPF</span>
                              <span className="text-[18px] text-[#344054] font-normal">
                                {personalData.cpf ? cpfMask(personalData.cpf) : 'Não Informado'}
                              </span>
                            </div>
                          )}

                          {personalData.customer_type === 'legal_person' && (
                            <div className="flex flex-col gap-[8px] items-start">
                              <span className="text-[#344054] text-[20px] font-medium">CNPJ</span>
                              <span className="text-[18px] text-[#344054] font-normal">
                                {personalData.cnpj ? personalData.cnpj : 'Não Informado'}
                              </span>
                            </div>
                          )}

                          {(personalData.customer_type === 'physical_person' || personalData.customer_type === 'representative') && (
                            <div className="flex flex-col gap-[8px] items-start">
                              <span className="text-[#344054] text-[20px] font-medium">RG</span>
                              <span className="text-[18px] text-[#344054] font-normal">
                                {personalData.rg ? rgMask(personalData.rg) : 'Não Informado'}
                              </span>
                            </div>
                          )}

                          {(personalData.customer_type === 'representative' || personalData.customer_type === 'physical_person') && (
                            <div className="flex flex-col gap-[8px] items-start">
                              <span className="text-[#344054] text-[20px] font-medium">Data de Nascimento</span>
                              <span className="text-[18px] text-[#344054]">
                                {personalData.birth ? personalData.birth.split('-').reverse().join('/') : 'Não Informado'}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col gap-[8px] items-start"></div>
                        </div>

                        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                          {(personalData.customer_type === 'representative' || personalData.customer_type === 'physical_person') && (
                            <div className="flex flex-col gap-[8px] items-start">
                              <span className="text-[#344054] text-[20px] font-medium">Nome da Mãe</span>
                              <span className="text-[18px] text-[#344054] font-normal">
                                {personalData.mother_name ? personalData.mother_name : 'Não Informado'}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col gap-[8px] items-start">
                            <span className="text-[#344054] text-[20px] font-medium">Naturalidade</span>
                            <span className="text-[18px] text-[#344054] font-normal">
                              {personalData.nationality
                                ? personalData.nationality === 'brazilian'
                                  ? `Brasileir${handleGender}`
                                  : `Estrangeir${handleGender}`
                                : 'Não Informado'}
                            </span>
                          </div>

                          <div className="flex flex-col gap-[8px] items-start">
                            <span className="text-[#344054] text-[20px] font-medium">Estado Civil</span>
                            <span className="text-[18px] text-[#344054] font-normal">
                              {handleTranslationGender(personalData.civil_status)}
                            </span>
                          </div>

                          <div className="flex flex-col gap-[8px] items-start">
                            <span className="text-[#344054] text-[20px] font-medium">Gênero</span>
                            <span className="text-[18px] text-[#344054] font-normal">
                              {personalData.gender
                                ? personalData.gender === 'male'
                                  ? 'Masculino'
                                  : 'Feminino'
                                : ''}
                            </span>
                          </div>

                          <div className="flex flex-col gap-[8px] items-start">
                            <span className="text-[#344054] text-[20px] font-medium">Capacidade</span>
                            <span className="text-[18px] text-[#344054] font-normal">{handleCapacity()}</span>
                          </div>

                          {personalData.represent && (
                            <div className="flex flex-col gap-[8px] items-start">
                              <span className="text-[#344054] text-[20px] font-medium">Representante</span>
                              <span className="text-[18px] text-[#344054] font-normal">
                                <a href={`/detalhes?type=cliente/representante&id=${personalData.represent.representor_id}`} className="text-[#344054] underline">
                                  {representorsList.map((representor: any) => {
                                    if (Number(representor.id) === personalData.represent.representor_id) {
                                      return `${representor.id} - ${representor.attributes.name}`;
                                    }
                                  })}
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

              <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
                <ContainerDetails className="gap-[18px]">
                  <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiMapPin size={24} color="#344054" />
                      <div className="w-[2px] bg-gray-300 h-8" />
                      <span className="text-[22px] font-medium text-[#344054]">Endereço</span>
                    </div>

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
                    <div className="flex flex-col gap-[18px] pb-[20px]">
                      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                        <div className="flex flex-col gap-[8px] items-start">
                          <span className="text-[20px] font-medium text-[#344054]">Endereço</span>
                          <span className="text-[18px] font-normal text-[#344054]">
                            {personalData.street ? personalData.street : 'Não Informado'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-[8px] items-start">
                          <span className="text-[20px] font-medium text-[#344054]">Número</span>
                          <span className="text-[18px] font-normal text-[#344054]">
                            {personalData.number ? personalData.number : 'Não Informado'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-[8px] items-start">
                          <span className="text-[20px] font-medium text-[#344054]">Complemento</span>
                          <span className="text-[18px] font-normal text-[#344054]">
                            {personalData.description ? personalData.description : 'Não Informado'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-[8px] items-start">
                          <span className="text-[20px] font-medium text-[#344054]">CEP</span>
                          <span className="text-[18px] font-normal text-[#344054]">
                            {personalData.zip_code ? personalData.zip_code : 'Não Informado'}
                          </span>
                        </div>
                      </div>

                      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                        <div className="flex flex-col gap-[8px] items-start">
                          <span className="text-[20px] font-medium text-[#344054]">Cidade</span>
                          <span className="text-[18px] font-normal text-[#344054]">
                            {personalData.city ? personalData.city : 'Não Informado'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-[8px] items-start">
                          <span className="text-[20px] font-medium text-[#344054]">Bairro</span>
                          <span className="text-[18px] font-normal text-[#344054]">
                            {personalData.neighborhood ? personalData.neighborhood : 'Não Informado'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-[8px] items-start">
                          <span className="text-[20px] font-medium text-[#344054]">Estado</span>
                          <span className="text-[18px] font-normal text-[#344054]">
                            {personalData.state ? personalData.state : 'Não Informado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </ContainerDetails>
              </DetailsWrapper>

              <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
                <ContainerDetails className="gap-[18px]">
                  <>
                    <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiMail size={24} color="#344054" />
                        <div className="w-[2px] bg-gray-300 h-8" />
                        <span className="text-[22px] font-medium text-[#344054]">Contato</span>
                      </div>
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
                      <div className="flex flex-col gap-[18px] pb-5">
                        <div className="grid gap-[18px] px-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                          <div className="flex flex-col gap-2 items-start w-[300px]">
                            <span className="text-[20px] font-medium text-[#344054]">Telefone</span>
                            <span className="text-[18px] font-normal text-[#344054] flex flex-col gap-2">
                              {phoneNumbers}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 items-start w-[220px]">
                            <span className="text-[20px] font-medium text-[#344054]">E-mail</span>
                            <span className="text-[18px] font-normal text-[#344054] flex flex-col gap-2">
                              {emailList}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 items-start w-[220px]" />
                        </div>
                      </div>
                    )}
                  </>
                </ContainerDetails>
              </DetailsWrapper>

              <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
                <ContainerDetails className="gap-[18px]">
                  <>
                    {session?.role !== 'trainee' && (
                      <>
                        <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiDollarSign size={24} color="#344054" />
                            <div className="w-[2px] bg-gray-300 h-8" />
                            <span className="text-[22px] font-medium text-[#344054]">Dados Bancários</span>
                          </div>
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
                          <div className="flex flex-col gap-[18px] pb-5">
                            <div className="grid gap-[18px] px-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>

                              {(['bank_name', 'agency', 'operation', 'account'] as BankAccountFields[]).map((field, index) => (
                                <div
                                  key={index}
                                  className={`flex flex-col gap-2 items-start ${field === 'bank_name' ? 'w-[300px]' : 'w-[220px]'}`}
                                >
                                  <span className="text-[20px] font-medium text-[#344054]">
                                    {field === 'bank_name' ? 'Banco' :
                                      field === 'agency' ? 'Agência' :
                                        field === 'operation' ? 'Operação' : 'Conta'}
                                  </span>
                                  <span className="text-[18px] font-normal text-[#344054]">
                                    {personalData.bank_accounts[0]?.[field] || 'Não Informado'}
                                  </span>
                                </div>
                              ))}
                              <div className="flex flex-col gap-2 items-start w-[220px]" />
                            </div>

                            <div className="grid gap-[18px] px-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                              <div className="flex flex-col gap-2 items-start w-[300px]">
                                <span className="text-[20px] font-medium text-[#344054]">Pix</span>
                                <span className="text-[18px] font-normal text-[#344054]">
                                  {personalData.bank_accounts[0]?.pix || 'Não Informado'}
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
                <DetailsWrapper className="border-b border-gray-400 shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
                  <ContainerDetails className="gap-[18px]">
                    <>
                      <div className="flex items-center justify-between bg-white border-b border-gray-400 px-8 py-5">
                        <div className="flex items-center gap-2">
                          <FiAlertCircle size={24} color="#344054" />

                          <div className="w-[2px] h-8 bg-gray-300" />

                          <span className="text-[22px] font-medium text-[#344054]">
                            Informações Adicionais
                          </span>
                        </div>

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
                        <div className="flex flex-col gap-[18px] pb-5">
                          <div className="grid gap-[18px] px-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                            <div className="flex flex-col gap-2 items-start w-[300px]">
                              <span className="text-[20px] font-medium text-[#344054]">Profissão</span>
                              <span className="text-[18px] font-normal text-[#344054]">
                                {personalData.profession || 'Não Informado'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 items-start w-[220px]">
                              <span className="text-[20px] font-medium text-[#344054]">Empresa Atual</span>
                              <span className="text-[18px] font-normal text-[#344054]">
                                {personalData.company || 'Não Informado'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 items-start w-[220px]">
                              <span className="text-[20px] font-medium text-[#344054]">Número de Benefício</span>
                              <span className="text-[18px] font-normal text-[#344054]">
                                {personalData.number_benefit || 'Não Informado'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 items-start w-[220px]">
                              <span className="text-[20px] font-medium text-[#344054]">NIT</span>
                              <span className="text-[18px] font-normal text-[#344054]">
                                {personalData.nit || 'Não Informado'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 items-start w-[220px]"></div>
                          </div>

                          <div className="grid gap-[18px] px-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                            <div className="flex flex-col gap-2 items-start w-[300px]">
                              <span className="text-[20px] font-medium text-[#344054]">Nome da Mãe</span>
                              <span className="text-[18px] font-normal text-[#344054]">
                                {personalData.mother_name || 'Não Informado'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 items-start w-[300px]">
                              <span className="text-[20px] font-medium text-[#344054]">Senha do meu INSS</span>
                              <span className="text-[18px] font-normal text-[#344054]">
                                {personalData.inss_password || 'Não Informado'}
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
        </>
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
