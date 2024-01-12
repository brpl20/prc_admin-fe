import { Box, Modal, Button } from '@mui/material';
import { Content, Title } from './styles';
import { MdClose } from 'react-icons/md';
import { Flex } from '@/styles/globals';

const ViewDetails = ({ isOpen, onClose, details }: any) => {
  const handleDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const day = date.getDate() + 1;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
  };

  return (
    <Modal open={isOpen}>
      <Content
        style={{
          width: '80vw',
          maxWidth: '1140px',
          height: 'min-content',
          maxHeight: '600px',
          overflow: 'auto',
          padding: '0px',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ borderBottom: '1px solid #C0C0C0' }}>
          <div
            style={{
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Title style={{ fontSize: '26px' }}>{'Informações sobre a Tarefa'}</Title>
            <MdClose size={26} cursor="pointer" onClick={onClose} />
          </div>
        </Box>

        <Box>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: '20px 0px',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '18px',
                padding: '0 32px',
              }}
            >
              <Flex
                style={{
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start',
                  width: '200px',
                }}
              >
                <span
                  style={{
                    color: '#344054',
                    fontSize: '20px',
                    fontWeight: '500',
                  }}
                >
                  Descrição
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {details.description ? details.description : 'Não Informado'}
                </span>
              </Flex>
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
                  Cliente
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {details.customer ? details.customer : 'Não Informado'}
                </span>
              </Flex>
              <Flex
                style={{
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start',
                  width: '200px',
                }}
              >
                <span
                  style={{
                    color: '#344054',
                    fontSize: '20px',
                    fontWeight: '500',
                  }}
                >
                  Prioridade
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {details.priority
                    ? details.priority === '1'
                      ? 'Normal'
                      : 'Alta'
                    : 'Não Informado'}
                </span>
              </Flex>
              <Flex
                style={{
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start',
                  width: '200px',
                }}
              >
                <span
                  style={{
                    color: '#344054',
                    fontSize: '20px',
                    fontWeight: '500',
                  }}
                >
                  Prazo de Entrega
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {details.deadline ? handleDeadline(details.deadline) : 'Não Informado'}
                </span>
              </Flex>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '18px',
                padding: '0 32px',
              }}
            >
              <Flex
                style={{
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start',
                  width: '200px',
                }}
              >
                <span
                  style={{
                    color: '#344054',
                    fontSize: '20px',
                    fontWeight: '500',
                  }}
                >
                  Responsável
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {details.responsible ? details.responsible : 'Não Informado'}
                </span>
              </Flex>
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
                  Trabalho
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {details.work ? details.work : 'Não Informado'}
                </span>
              </Flex>
              <Flex
                style={{
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start',
                  width: '200px',
                }}
              >
                <span
                  style={{
                    color: '#344054',
                    fontSize: '20px',
                    fontWeight: '500',
                  }}
                >
                  Status
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#344054',
                    fontWeight: '400',
                  }}
                >
                  {details.status ? details.status : 'Não Informado'}
                </span>
              </Flex>
            </div>

            <Flex
              style={{
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'flex-start',
                padding: '0px 32px',
                height: '100%',
              }}
            >
              <span
                style={{
                  color: '#344054',
                  fontSize: '20px',
                  fontWeight: '500',
                }}
              >
                Comentários
              </span>
              <textarea
                style={{
                  fontSize: '18px',
                  color: '#344054',
                  fontWeight: '400',
                  width: '100%',
                  height: '120px',
                  resize: 'none',
                  overflow: 'auto',
                  padding: '10px',
                  borderRadius: '4px',
                }}
                disabled
              >
                {details.comment ? details.comment : 'Não Informado'}
              </textarea>
            </Flex>
          </div>
        </Box>

        <Box
          display="flex"
          justifyContent="end"
          sx={{ padding: '20px 32px', borderTop: '1px solid #C0C0C0' }}
        >
          <Button
            color="primary"
            variant="outlined"
            sx={{
              width: '100px',
              height: '36px',
            }}
            onClick={onClose}
          >
            {'Fechar'}
          </Button>
        </Box>
      </Content>
    </Modal>
  );
};

export default ViewDetails;
