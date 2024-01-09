import { useEffect, useState } from 'react';
import {
  BoxInfo,
  ButtonShowContact,
  ButtonShowData,
  ContainerDetails,
  DetailsWrapper,
  Flex,
  GridInfo,
} from '../../styles';
import { getAllWorks } from '@/services/works';
import { Box } from '@mui/material';

import { MdKeyboardArrowDown } from 'react-icons/md';
import { getCustomerById } from '@/services/customers';
import Link from 'next/link';

interface PersonalWorksProps {
  id: string | string[];
}

const PersonalWorks = ({ id }: PersonalWorksProps) => {
  const [personalWorks, setPersonalWorks] = useState<any>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [workIsOpen, setWorkIsOpen] = useState<{ [key: string]: boolean }>({});
  const [responsibleLawyer, setResponsibleLawyer] = useState<string | null>(null);

  const handleResponsableLawyer = async (responsibleLawyerId: string) => {
    const { data } = await getCustomerById(responsibleLawyerId);

    const full_name = `${data.attributes.name} ${data.attributes.last_name}`;

    setResponsibleLawyer(full_name);
  };

  useEffect(() => {
    const getData = async () => {
      const { data: works } = await getAllWorks();
      const clientWorks = works.filter((work: any) => work.attributes.responsible_lawyer == id);

      const initialWorkState = clientWorks.reduce(
        (acc: { [key: string]: boolean }, work: any, index: any) => {
          acc[index] = false;
          return acc;
        },
        {},
      );
      setWorkIsOpen(initialWorkState);

      setPersonalWorks(clientWorks);
    };

    getData();
  }, [id]);

  return (
    <DetailsWrapper>
      <Flex>
        <ButtonShowData
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            width: '100%',
          }}
        >
          <span>Trabalhos</span>
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
          {personalWorks.length > 0 ? (
            personalWorks.map((work: any, index: number) => {
              return (
                <Box
                  key={work.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <ButtonShowContact
                    onClick={async () => {
                      await handleResponsableLawyer(work.attributes.responsible_lawyer);
                      setWorkIsOpen(prev => ({
                        ...prev,
                        [index]: !prev[index],
                      }));
                    }}
                  >
                    <strong
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      Trabalho {index + 1}{' '}
                      <MdKeyboardArrowDown
                        style={{
                          fontSize: '1.5rem',
                          transition: 'all 0.2s',
                          transform: workIsOpen[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                        size={24}
                      />
                    </strong>
                  </ButtonShowContact>

                  <Box
                    style={{
                      width: '100%',
                    }}
                  >
                    {workIsOpen[index] && (
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                        }}
                      >
                        <GridInfo
                          style={{
                            width: '100%',
                          }}
                        >
                          <BoxInfo>
                            <strong>Número</strong>
                            <span>{work.attributes.number}</span>
                          </BoxInfo>
                          <BoxInfo>
                            <strong>Advogado Responsável</strong>
                            <span>{responsibleLawyer}</span>
                          </BoxInfo>
                          <BoxInfo>
                            <strong>Cliente</strong>
                            <span>Não Informado</span>
                          </BoxInfo>
                          <BoxInfo>
                            <strong>Assunto</strong>
                            <span>{work.attributes.note}</span>
                          </BoxInfo>
                          <BoxInfo>
                            <strong>Procedimento</strong>
                            <span>{work.attributes.procedure}</span>
                          </BoxInfo>
                        </GridInfo>
                        <GridInfo
                          style={{
                            width: '100%',
                          }}
                        >
                          <Link href="#" legacyBehavior>
                            <a
                              style={{
                                textDecoration: 'none',
                                width: '100%',
                              }}
                            >
                              <BoxInfo>
                                <strong>Ver mais ...</strong>
                              </BoxInfo>
                            </a>
                          </Link>
                        </GridInfo>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })
          ) : (
            <BoxInfo>
              <strong>Nenhum trabalho cadastrado</strong>
            </BoxInfo>
          )}
        </ContainerDetails>
      )}
    </DetailsWrapper>
  );
};

export default PersonalWorks;
