import { getOfficeById } from '@/services/offices';

import { useEffect, useState } from 'react';

import { ContainerDetails, Flex, DetailsWrapper, ButtonShowContact } from '../styles';
import { Box, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { IProfileAdmin } from '@/interfaces/IAdmin';
import { getAllProfileAdmins } from '@/services/admins';
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
      data: IProfileAdmin[];
    } = await getAllProfileAdmins('');
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
        <div className="flex justify-center items-center h-screen">
          <CircularProgress />
        </div>
      )}

      {!loading && officeData && (
        <div className="flex flex-col gap-[20px] p-5 rounded-lg">
          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">
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
                </div>

                {officeDataIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Nome</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.name ? officeData.name : ''} ${
                            officeData.last_name ? officeData.last_name : ''
                          }`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Tipo de Escritório
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.office_type_description || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">OAB</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.oab || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">CNPJ</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.cnpj || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]"></div>
                    </div>

                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Tipo da Sociedade
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.society === 'company'
                            ? 'Empresarial'
                            : officeData.society === 'sole_proprietorship'
                            ? 'Sociedade Simples'
                            : officeData.society === 'individual'
                            ? 'Sociedade Empresária'
                            : 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Data de Função Exp. OAB
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.foundation
                            ? officeData.foundation.split('-').reverse().join('/')
                            : 'Não Informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">Endereço</span>

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
                </div>

                {officeAddressIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Endereço</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.street || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Número</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.number || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Complemento</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          Não Informado
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">CEP</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.cep || 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]"></div>
                    </div>

                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Cidade</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.city || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Bairro</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.neighborhood || 'Não Informado'}`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <span className="text-[#344054] text-[20px] font-medium">Estado</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${officeData.state || 'Não Informado'}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">Contato</span>

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
                </div>

                {officeContactIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px] w-[300px]">
                        <span className="text-[#344054] text-[20px] font-medium">Telefone</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${
                            officeData.phones &&
                            officeData.phones[0] &&
                            officeData.phones[0].phone_number
                              ? officeData.phones[0].phone_number
                              : 'Não Informado'
                          }`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[220px]">
                        <span className="text-[#344054] text-[20px] font-medium">E-mail</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {`${
                            officeData.emails && officeData.emails[0] && officeData.emails[0].email
                              ? officeData.emails[0].email
                              : 'Não Informado'
                          }`}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[220px]"></div>
                    </div>
                  </div>
                )}
              </>
            </ContainerDetails>
          </DetailsWrapper>

          <DetailsWrapper className="border-b border-[#C0C0C0] shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
            <ContainerDetails className="gap-[18px]">
              <>
                <div className="flex bg-white px-8 py-5 border-b border-[#C0C0C0] items-center justify-between">
                  <span className="text-[22px] font-medium text-[#344054]">
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
                </div>

                {officeAdicionalIsOpen && (
                  <div className="flex flex-col gap-[18px] pb-[20px]">
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[18px] px-8">
                      <div className="flex flex-col gap-[8px] w-[300px]">
                        <span className="text-[#344054] text-[20px] font-medium">Site</span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.site ? officeData.site : 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[330px]">
                        <span className="text-[#344054] text-[20px] font-medium">
                          Responsável pelo Escritório
                        </span>
                        <span className="text-[18px] text-[#344054] font-normal">
                          {officeData.responsible_lawyer_id
                            ? officeData.responsible_lawyer_id
                            : 'Não Informado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] w-[220px]"></div>
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
