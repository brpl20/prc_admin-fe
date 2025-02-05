import { PiSuitcase } from 'react-icons/pi';
import { ContainerDetails, DetailsWrapper } from '../../Details/styles';
import dayjs from 'dayjs';

interface WorkInfoCardProps {
  client: React.ReactNode;
  responsible: React.ReactNode;
  number: React.ReactNode;
  date: string;
}

const WorkInfoCard = ({ client, responsible, number, date }: WorkInfoCardProps) => {
  const formatted_date = dayjs(date).format('DD/MM/YYYY') || 'Não informado';

  return (
    <DetailsWrapper
      style={{
        marginTop: 32,
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
              <PiSuitcase size={26} color="#344054" />

              <div className="w-[2px] bg-gray-300 h-8" />

              <span
                style={{
                  fontSize: '22px',
                  fontWeight: '500',
                  color: '#344054',
                }}
              >
                Dados do Trabalho
              </span>
            </div>
          </div>
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                  Cliente:
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {client || 'Não informado'}
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
                  Responsável:
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {responsible || 'Não informado'}
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
                  N° do trabalho:
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {number || 'Não informado'}
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
                  Data de criação do trabalho:
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {formatted_date}
                </span>
              </div>
            </div>
          </div>
        </>
      </ContainerDetails>
    </DetailsWrapper>
  );
};

export default WorkInfoCard;
